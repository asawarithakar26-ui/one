import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Soft magnetic effect tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Fetch tasks from local backend on component mount
  useEffect(() => {
    fetch('http://localhost:3000/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data)
      })
      .catch(err => console.error('Error fetching tasks API:', err))
  }, [])

  // Handler for saving standard cinematic nodes (tasks)
  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    try {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newTaskText,
          time: timeString,
          priority: 'High'
        })
      });

      if (response.ok) {
        const savedTask = await response.json()
        setTasks([...tasks, savedTask])
        setNewTaskText('')
      }
    } catch (err) {
      console.error('Failed to post new task:', err)
    }
  }

  // Handle task deletion via clicking the node
  const handleDeleteTask = async (id) => {
    try {
      const resp = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'DELETE'
      })
      if (resp.ok) {
        setTasks(tasks.filter(t => t.id !== id))
      }
    } catch (e) {
      console.error('Failed to delete node:', e)
    }
  }

  return (
    <div style={{ padding: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-6)', height: '100vh' }}>
      
      {/* Sidebar: Context Panel */}
      <aside className="surface-container-low" style={{ width: '320px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="aether-orb"></div>
          <div>
            <h1 className="text-headline-md" style={{ fontSize: '1.25rem' }}>Aether AI</h1>
            <p className="text-label-md">Cinematic Intelligence</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <h2 className="text-label-md" style={{ color: 'var(--primary-dim)' }}>Context Modules</h2>
          
          <button className="surface-container-highest magnetic-hover" style={{ padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'var(--on-surface)' }}>
            <span className="text-headline-md" style={{ fontSize: '1rem' }}>Calendar View</span>
            <p className="text-technical" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Active TimeFlow</p>
          </button>
          
          <button className="surface-container-highest magnetic-hover" style={{ padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'var(--on-surface)' }}>
            <span className="text-headline-md" style={{ fontSize: '1rem' }}>Task Context</span>
            <p className="text-technical" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>{tasks.length} Pending Nodes</p>
          </button>

          <button className="surface-container-highest magnetic-hover" style={{ padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'var(--on-surface)' }}>
            <span className="text-headline-md" style={{ fontSize: '1rem' }}>Data Lake</span>
            <p className="text-technical" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Analyzing Activity</p>
          </button>
        </div>

        <button className="btn-primary">Initialize Sequence</button>
      </aside>

      {/* Main Content Area: Task & Calendar Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        
        {/* Top Floating Header */}
        <header className="glass-float" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-display-lg" style={{ fontSize: '2.5rem' }}>Today's TimeFlow</h2>
          <div className="text-technical" style={{ fontSize: '1rem', color: 'var(--secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Task Board */}
        <div className="surface-container-low" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-headline-md">Active Tasks</h3>
            <span className="text-label-md">Status: DB Synchronized</span>
          </div>
          
          <div className="divider"></div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', overflowY: 'auto' }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="surface-container-highest magnetic-hover" 
                onClick={() => handleDeleteTask(task.id)}
                style={{
                  padding: '20px', 
                  flex: '1 1 calc(50% - 16px)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                title="Click to resolve and delete task"
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--primary-container)' }}></div>
                <div className="text-technical" style={{ color: 'var(--primary-dim)' }}>{task.time}</div>
                <div className="text-headline-md" style={{ fontSize: '1.1rem' }}>{task.text}</div>
              </div>
            ))}
          </div>

          {/* Cinematic Input Example */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              className="input-cinematic" 
              placeholder="Inject new context or task..." 
              style={{ flex: 1 }}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
              }}
            />
            <button 
              className="glass-float magnetic-hover" 
              style={{ padding: '0 24px', color: 'var(--primary-dim)', cursor: 'pointer', border: 'none' }}
              onClick={handleAddTask}
            >
              + Add Node
            </button>
          </div>
        </div>

      </main>

    </div>
  )
}

export default App
