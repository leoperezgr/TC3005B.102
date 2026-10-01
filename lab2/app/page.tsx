"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase.config";

type Empleado = {
  id: string;
  nombre: string;
};

async function obtenerEmpleados(): Promise<Empleado[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "empleados"));
  return snapshot.docs.map((d) => ({ id: d.id, nombre: d.data().nombre }));
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const fetchEmpleados = async () => {
    setEmpleados(await obtenerEmpleados());
  };

  useEffect(() => {
    obtenerEmpleados().then(setEmpleados);
  }, []);

  const handleAdd = async () => {
    if (!db || !inputText.trim()) return;
    await addDoc(collection(db, "empleados"), { nombre: inputText.trim() });
    setInputText("");
    fetchEmpleados();
  };

  const handleDelete = async (id: string) => {
    if (!db || !id) return;
    await deleteDoc(doc(db, "empleados", id));
    fetchEmpleados();
  };

  const handleEdit = async (id: string) => {
    const editValue = prompt("Nuevo nombre del empleado");
    if (!db || !editValue) return;
    await updateDoc(doc(db, "empleados", id), { nombre: editValue });
    fetchEmpleados();
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>NextJS Firebase</h1>

      <input
        type="text"
        className="border-2"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button className="border p-2" onClick={handleAdd}>
        Agregar
      </button>

      <ul>
        {empleados.map((item) => (
          <li key={item.id}>
            {item.nombre}
            <button
              className="p-2 border bg-yellow-500 text-white cursor-pointer"
              onClick={() => {
                handleEdit(item.id);
              }}
            >
              Edit
            </button>
            <button
              className="p-2 border bg-red-500 text-white cursor-pointer"
              onClick={() => {
                handleDelete(item.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
