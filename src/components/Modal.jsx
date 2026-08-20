export default function Modal({ aberto, titulo, onFechar, children }) {
  if (!aberto) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onFechar}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          minWidth: '320px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2>{titulo}</h2>
          <button onClick={onFechar}>×</button>
        </div>

        {children}
      </div>
    </div>
  )
}