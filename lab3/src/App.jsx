import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
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

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [staggerDone, setStaggerDone] = useState(false);
  const [freshId, setFreshId] = useState(null);
  const [burst, setBurst] = useState(null); // { id, key } de la última tarea completada
  const deleteTimer = useRef(null);

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
    if (!newTodo.trim()) return; // Evita insertar strings vacíos

    const newTodoData = {
      name: newTodo.trim(),
      isCompleted: false,
    };

    setAdding(true);
    const { data, error } = await supabase
      .from("pendientes")
      .insert([newTodoData])
      .select(); // Esto hace que retorne los datos insertados
    setAdding(false);

    if (error) {
      console.log("Error en el insert: ", error);
      setError("No se pudo agregar la tarea. Intenta de nuevo.");
    } else {
      // data será un array, toma el primer elemento
      setTodoList((prev) => [...prev, data[0]]);
      setFreshId(data[0].id);
      setNewTodo("");
      setError("");
    }
  };

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
          id="new-todo"
          name="new-todo"
          type="text"
          autoComplete="off"
          placeholder="Nueva tarea…"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={adding || !newTodo.trim()}>
          <Plus size={16} weight="bold" aria-hidden="true" />
          {adding ? "Agregando…" : "Agregar"}
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
                  key={todo.id}
                  layout="position"
                  className={`row${todo.isCompleted ? " is-done" : ""}${todo.id === freshId ? " is-new" : ""}`}
                  initial={{ opacity: 0, transform: "translateY(8px) scale(0.98)" }}
                  animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                  exit={{
                    opacity: 0,
                    transform: "translateY(0px) scale(0.98)",
                    transition: { duration: 0.15, ease: EASE_OUT },
                  }}
                  transition={{ ...ROW_SPRING, delay: staggerDone ? 0 : Math.min(i, 8) * 0.04 }}
                  onAnimationComplete={() => todo.id === freshId && setFreshId(null)}
                >
                  <button
                    className="check"
                    role="checkbox"
                    aria-checked={todo.isCompleted}
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
