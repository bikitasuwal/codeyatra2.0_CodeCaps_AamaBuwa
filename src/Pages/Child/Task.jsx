import { useState, useEffect } from "react";
import { Plus, Calendar, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Task() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState(null);
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your backend URL
  const API_URL = "http://10.5.5.143:5005";

  // Get user data from sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchParentAndTasks(parsedUser.id);
    } else {
      navigate("/");
    }
  }, []);

  // Fetch parent and tasks
  const fetchParentAndTasks = async (caregiverId) => {
    try {
      // First get the parent
      const parentResponse = await fetch(`${API_URL}/api/my-parents?user_id=${caregiverId}`);
      const parentData = await parentResponse.json();
      
      if (parentData.success && parentData.parents.length > 0) {
        const parentInfo = parentData.parents[0];
        setParent(parentInfo);
        
        // Then get tasks for this parent
        const tasksResponse = await fetch(`${API_URL}/api/parent-tasks/${parentInfo.id}?caregiver_id=${caregiverId}`);
        const tasksData = await tasksResponse.json();
        
        if (tasksData.success) {
          setTasks(tasksData.tasks);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !user || !parent) return;

    try {
      const response = await fetch(`${API_URL}/api/add-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: user.id,
          parent_id: parent.id,
          title: newTask,
          description: ""
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh tasks
        const tasksResponse = await fetch(`${API_URL}/api/parent-tasks/${parent.id}?caregiver_id=${user.id}`);
        const tasksData = await tasksResponse.json();
        
        if (tasksData.success) {
          setTasks(tasksData.tasks);
        }
        
        setNewTask("");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/update-task/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setTasks(tasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    // Note: You'll need to add a DELETE endpoint in your backend
    // For now, we'll just filter locally
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center">
        <div className="text-orange-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-orange-400 text-xl font-semibold">आमा-बुवा</h1>
              <p className="text-xs text-gray-400 tracking-widest">AAMABUWA</p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full border border-orange-400 flex items-center justify-center text-orange-400">
            {user?.full_name?.charAt(0) || "U"}
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            <p className="text-gray-400 text-sm">
              {parent ? `Tasks for ${parent.full_name}` : "Manage care routines and errands."}
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
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="w-5 h-5 rounded-md border-2 border-orange-400 mt-1 cursor-pointer flex items-center justify-center"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>{task.due_date || "TODAY"}</span>
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