import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Check, Plus, Trash, ArrowCounterClockwise, WarningCircle } from "@phosphor-icons/react";
import "./App.css";
import supabase from "./supabase-client";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Pendientes" },
  { key: "done", label: "Completadas" },
];

const UNDO_MS = 5000;

// Curva fuerte ease-out (skill animate) y resortes sin rebote para la UI
const EASE_OUT = [0.23, 1, 0.32, 1];
const ROW_SPRING = { type: "spring", duration: 0.35, bounce: 0 };
const CHECK_SPRING = { type: "spring", duration: 0.3, bounce: 0.3 };
const FLIGHT_MS = 560;

// Las tareas guardadas usan su id; las que van en camino a Supabase usan una llave temporal
const rowKey = (todo) => todo.key ?? todo.id;

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [staggerDone, setStaggerDone] = useState(false);
  const [freshKey, setFreshKey] = useState(null);
  const [flight, setFlight] = useState(null); // { key, text, from: { x, y } }
  const [burst, setBurst] = useState(null); // { id, key } de la última tarea completada
  const deleteTimer = useRef(null);
  const inputRef = useRef(null);
  const ghostRef = useRef(null);
  const flightAnims = useRef([]);
  const tempCount = useRef(0);
  const reduceMotion = useReducedMotion();

  const consulta = async () => {
    const { data, error } = await supabase
      .from("pendientes")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.log("Error de conexion en consulta: ", error);
      setError("No se pudo cargar la lista. Revisa tu conexión y reintenta.");
      setStatus("error");
    } else {
      setTodoList(data);
      setStatus("ready");
      // Sólo la primera carga entra escalonada; lo que se agrega después entra al instante
      setTimeout(() => setStaggerDone(true), 400);
    }
  };

  useEffect(() => {
    consulta();
    return () => clearTimeout(deleteTimer.current);
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const name = newTodo.trim();
    if (!name) return; // Evita insertar strings vacíos

    // Punto de despegue: donde empieza el texto dentro del campo
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    const style = getComputedStyle(input);
    const lineHeight = parseFloat(style.fontSize) * 1.5;
    const from = {
      x: rect.left + parseFloat(style.paddingLeft),
      y: rect.top + (rect.height - lineHeight) / 2,
    };

    // Inserción optimista: la fila aparece de inmediato y el texto vuela hacia ella
    const key = `tmp-${++tempCount.current}`;
    flightAnims.current.forEach((a) => a.finish());
    setTodoList((prev) => [...prev, { key, id: null, name, isCompleted: false }]);
    setFreshKey(key);
    if (!reduceMotion && filter !== "done") setFlight({ key, text: name, from });
    setNewTodo("");
    setError("");
    // El destello dura 1.2 s después de aterrizar; luego la fila queda normal
    setTimeout(() => setFreshKey((k) => (k === key ? null : k)), FLIGHT_MS + 1300);

    const { data, error } = await supabase
      .from("pendientes")
      .insert([{ name, isCompleted: false }])
      .select(); // Esto hace que retorne los datos insertados

    if (error) {
      console.log("Error en el insert: ", error);
      setError("No se pudo agregar la tarea. Intenta de nuevo.");
      setTodoList((prev) => prev.filter((t) => t.key !== key));
      setNewTodo(name);
    } else {
      // Conserva la llave temporal para que React no vuelva a montar la fila
      setTodoList((prev) => prev.map((t) => (t.key === key ? { ...data[0], key } : t)));
    }
  };

  // Vuelo del texto: del campo a la posición final de la nueva fila
  useLayoutEffect(() => {
    if (!flight) return;
    const ghost = ghostRef.current;
    const target = document.querySelector(`[data-key="${flight.key}"] .name`);
    if (!ghost || !target) {
      setFlight(null);
      return;
    }
    target.scrollIntoView({ block: "nearest" });
    const to = target.getBoundingClientRect();
    const dx = to.left - flight.from.x;
    const dy = to.top - flight.from.y;
    const opts = { duration: FLIGHT_MS, fill: "forwards" };

    // Y arranca rápido y X después: el recorrido traza un arco en lugar de una línea recta
    const outer = ghost.animate(
      [{ transform: "translateX(0px)" }, { transform: `translateX(${dx}px)` }],
      { ...opts, easing: "cubic-bezier(0.77, 0, 0.175, 1)" }
    );
    const inner = ghost.firstChild.animate(
      [{ transform: "translateY(0px)" }, { transform: `translateY(${dy}px)` }],
      { ...opts, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
    );
    // Se "levanta" un poco al despegar y se asienta al aterrizar
    const lift = ghost.firstChild.firstChild.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.05)", offset: 0.3 }, { transform: "scale(1)" }],
      { ...opts, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
    // Tarjeta detrás del texto: aparece al despegar y se disuelve al aterrizar
    const card = ghost.firstChild.firstChild.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
      { ...opts, easing: "ease", pseudoElement: "::before" }
    );
    flightAnims.current = [outer, inner, lift, card];
    inner.onfinish = () => setFlight((f) => (f?.key === flight.key ? null : f));
  }, [flight]);

  const completeTask = async (id, isCompleted) => {
    if (!isCompleted) setBurst((b) => ({ id, key: (b?.key ?? 0) + 1 }));
    // Actualización optimista: se revierte si Supabase falla
    setTodoList((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo))
    );
    const { error } = await supabase
      .from("pendientes")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.log("error en el update task: ", error);
      setError("No se pudo actualizar la tarea. Intenta de nuevo.");
      setTodoList((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, isCompleted } : todo))
      );
    }
  };

  const commitDelete = async (todo) => {
    const { error } = await supabase.from("pendientes").delete().eq("id", todo.id);
    if (error) {
      console.log("error deleting task: ", error);
      setError("No se pudo eliminar la tarea. Se restauró en la lista.");
      setTodoList((prev) => [...prev, todo].sort((a, b) => a.id - b.id));
    }
  };

  // Elimina de la vista de inmediato y da una ventana para deshacer
  const deleteTask = (todo) => {
    if (pendingDelete) {
      clearTimeout(deleteTimer.current);
      commitDelete(pendingDelete);
    }
    setTodoList((prev) => prev.filter((t) => t.id !== todo.id));
    setPendingDelete(todo);
    deleteTimer.current = setTimeout(() => {
      commitDelete(todo);
      setPendingDelete(null);
    }, UNDO_MS);
  };

  const undoDelete = () => {
    clearTimeout(deleteTimer.current);
    setTodoList((prev) => [...prev, pendingDelete].sort((a, b) => a.id - b.id));
    setPendingDelete(null);
  };

  const remaining = todoList.filter((t) => !t.isCompleted).length;
  const visible = todoList.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.isCompleted : !t.isCompleted
  );

  return (
    <MotionConfig reducedMotion="user">
    <main className="app">
      <header className="app-header">
        <h1>Pendientes</h1>
        {status === "ready" && (
          <p className="meta">
            {remaining === 0 ? (
              "Todo al día"
            ) : (
              <>
                <span className="count">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={remaining}
                      initial={{ opacity: 0, transform: "translateY(6px)" }}
                      animate={{ opacity: 1, transform: "translateY(0px)" }}
                      exit={{ opacity: 0, transform: "translateY(-6px)" }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                    >
                      {remaining}
                    </motion.span>
                  </AnimatePresence>
                </span>{" "}
                {remaining === 1 ? "tarea pendiente" : "tareas pendientes"}
              </>
            )}
          </p>
        )}
      </header>

      <form className="composer" onSubmit={addTodo}>
        <label htmlFor="new-todo" className="sr-only">
          Nueva tarea
        </label>
        <input
          ref={inputRef}
          id="new-todo"
          name="new-todo"
          type="text"
          autoComplete="off"
          placeholder="Nueva tarea…"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={!newTodo.trim()}>
          <Plus size={16} weight="bold" aria-hidden="true" />
          Agregar
        </button>
      </form>

      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Filtrar tareas">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              className="tab"
              onClick={() => setFilter(f.key)}
            >
              {filter === f.key && (
                <motion.span
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                />
              )}
              <span className="tab-label">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="feedback">
        {error && status !== "error" && (
          <p className="inline-error">
            <WarningCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <section className="panel" aria-busy={status === "loading"}>
        {status === "loading" && (
          <ul className="list" aria-label="Cargando tareas">
            {[72, 54, 64].map((w) => (
              <li key={w} className="row skeleton">
                <span className="sk-box" />
                <span className="sk-line" style={{ width: `${w}%` }} />
              </li>
            ))}
          </ul>
        )}

        {status === "error" && (
          <div className="state">
            <p className="state-title">Sin conexión con la base de datos</p>
            <p className="state-body">{error}</p>
            <button className="btn-secondary" onClick={() => {
                setStatus("loading");
                consulta();
              }}>
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="state">
            <p className="state-title">
              {todoList.length === 0
                ? "No hay tareas todavía"
                : filter === "done"
                  ? "Aún no completas ninguna tarea"
                  : "No quedan tareas pendientes"}
            </p>
            <p className="state-body">
              {todoList.length === 0
                ? "Agrega tu primera tarea con el campo de arriba."
                : "Cambia de filtro para ver el resto."}
            </p>
          </div>
        )}

        {status === "ready" && visible.length > 0 && (
          <ul className="list">
            <AnimatePresence mode="popLayout" initial={true}>
              {visible.map((todo, i) => (
                <motion.li
                  key={rowKey(todo)}
                  data-key={rowKey(todo)}
                  layout="position"
                  className={`row${todo.isCompleted ? " is-done" : ""}${flight?.key === rowKey(todo) ? " is-landing" : rowKey(todo) === freshKey ? " is-new" : ""}`}
                  initial={
                    rowKey(todo) === freshKey
                      ? { opacity: 0, transform: "translateY(0px) scale(1)" } // la fila no se mueve: el texto vuela hacia ella
                      : { opacity: 0, transform: "translateY(8px) scale(0.98)" }
                  }
                  animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                  exit={{
                    opacity: 0,
                    transform: "translateY(0px) scale(0.98)",
                    transition: { duration: 0.15, ease: EASE_OUT },
                  }}
                  transition={{ ...ROW_SPRING, delay: staggerDone ? 0 : Math.min(i, 8) * 0.04 }}
                >
                  <button
                    className="check"
                    role="checkbox"
                    aria-checked={todo.isCompleted}
                    disabled={todo.id === null}
                    aria-label={`Marcar "${todo.name}" como ${todo.isCompleted ? "pendiente" : "completada"}`}
                    onClick={() => completeTask(todo.id, todo.isCompleted)}
                  >
                    {burst?.id === todo.id && todo.isCompleted && (
                      <motion.span
                        key={burst.key}
                        className="check-burst"
                        aria-hidden="true"
                        initial={{ opacity: 0.5, transform: "scale(1)" }}
                        animate={{ opacity: 0, transform: "scale(2.2)" }}
                        transition={{ duration: 0.45, ease: EASE_OUT }}
                      />
                    )}
                    <motion.span
                      className="check-icon"
                      aria-hidden="true"
                      initial={false}
                      animate={
                        todo.isCompleted
                          ? { opacity: 1, transform: "scale(1)" }
                          : { opacity: 0, transform: "scale(0.5)" }
                      }
                      transition={CHECK_SPRING}
                    >
                      <Check size={12} weight="bold" />
                    </motion.span>
                  </button>
                  <span className="name">
                    <span className="name-text">{todo.name}</span>
                  </span>
                  <button
                    className="icon-btn"
                    aria-label={`Eliminar "${todo.name}"`}
                    disabled={todo.id === null}
                    onClick={() => deleteTask(todo)}
                  >
                    <Trash size={16} aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {flight && (
        <span
          ref={ghostRef}
          className="flight"
          aria-hidden="true"
          style={{ left: flight.from.x, top: flight.from.y }}
        >
          <span className="flight-y">
            <span className="flight-text">{flight.text}</span>
          </span>
        </span>
      )}

      <div className="toast-region" aria-live="polite">
        {pendingDelete && (
          <div className="toast">
            <span className="toast-text">Tarea eliminada</span>
            <button className="toast-action" onClick={undoDelete}>
              <ArrowCounterClockwise size={14} aria-hidden="true" />
              Deshacer
            </button>
          </div>
        )}
      </div>
    </main>
    </MotionConfig>
  );
}
export default App;
