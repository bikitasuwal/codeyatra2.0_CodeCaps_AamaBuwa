import { useState } from "react";
import { Plus, Calendar, Trash2 } from "lucide-react";

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      date: "TODAY",
      completed: false,
    };

    setTasks([task, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-orange-400 text-xl font-semibold">आमा-बुवा</h1>
            <p className="text-xs text-gray-400 tracking-widest">AAMABUWA</p>
          </div>

          <div className="w-10 h-10 rounded-full border border-orange-400 flex items-center justify-center text-orange-400">
            B
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            <p className="text-gray-400 text-sm">
              Manage care routines and errands.
            </p>
          </div>

          <button
            onClick={addTask}
            className="bg-orange-400 hover:bg-orange-500 transition p-3 rounded-full"
          >
            <Plus size={20} className="text-black" />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add new task..."
            className="w-full bg-[#111827] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-3">ACTIVE TASKS</p>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#111827] rounded-xl p-4 flex items-start gap-4 hover:bg-[#1A2233] transition"
                >
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded-md border-2 border-orange-400 mt-1 cursor-pointer flex items-center justify-center"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>{task.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mt-8 mb-3">
              COMPLETED RECENTLY
            </p>

            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#111827] rounded-xl p-4 flex items-center justify-between opacity-70"
                >
                  <p className="line-through text-gray-400">
                    {task.title}
                  </p>

                  <Trash2
                    size={16}
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-500 cursor-pointer hover:text-red-400"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-16 text-sm">
            No tasks yet. Tap + to add one ✨
          </div>
        )}

      </div>
    </div>
  );
}