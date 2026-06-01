import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUsers, getCurrentUser, setCurrentUser, useStore } from '../store'

export default function Header() {
  useStore()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const users = getUsers()

  useEffect(() => {
    function onClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function switchUser(id) {
    setCurrentUser(id)
    setOpen(false)
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-name">Friendly Bet</span>
        </Link>

        <div className="header-right">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
            + New Bet
          </button>

          <div className="user-switcher" ref={dropRef}>
            <button className="user-switcher-btn" onClick={() => setOpen(o => !o)}>
              <Avatar user={currentUser} size="sm" />
              <span>
                <div className="user-switcher-label">Demo mode</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.1 }}>
                  {currentUser?.name.split(' ')[0]}
                </div>
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>▼</span>
            </button>

            {open && (
              <div className="user-dropdown">
                <div className="user-dropdown-hint">Switch perspective</div>
                {users.map(u => (
                  <div
                    key={u.id}
                    className={`user-dropdown-item ${u.id === currentUser?.id ? 'active' : ''}`}
                    onClick={() => switchUser(u.id)}
                  >
                    <Avatar user={u} size="sm" />
                    {u.name}
                    {u.id === currentUser?.id && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export function Avatar({ user, size = 'md' }) {
  if (!user) return null
  return (
    <div
      className={`avatar ${size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : ''}`}
      style={{ background: user.color }}
    >
      {user.initials}
    </div>
  )
}
