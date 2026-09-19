import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(4,8,16,0.97)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12,
          fontFamily:'Verdana,sans-serif',
        }}>
          <div style={{ color:'#EF4444', fontSize:14, fontWeight:'bold' }}>Błąd komponentu</div>
          <div style={{ color:'#F87171', fontSize:10, maxWidth:500, textAlign:'center', background:'rgba(30,5,5,0.6)', border:'1px solid rgba(220,38,38,0.3)', padding:'8px 16px', borderRadius:6 }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => { this.setState({ error: null }); }}
            style={{ padding:'7px 20px', background:'rgba(29,78,216,0.25)', color:'#93C5FD', border:'1px solid rgba(59,130,246,0.4)', borderRadius:5, cursor:'pointer', fontSize:11 }}
          >
            Spróbuj ponownie
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
