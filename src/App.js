// import logo from './logo.svg';
// import './App.css';
import { Outlet, Link } from 'react-router-dom';
import { Header } from './components/Header/Header'

function App() {
  return (
    <div className="App">
      <Header className="App-header"></Header>
      {/* <h1>Recognitions</h1> */}
        <nav style={{ padding: '1rem 0', textAlign: 'center', fontSize: '12px' }}>
          <Link to="/">Home</Link> | {' '}
          <Link to="/odometer">Odometer</Link> | {' '}
          <Link to="/vehicle-document">Vehicle Document</Link> | {' '}
          <Link to="/driver-license">Driver License</Link> | {' '}
          <Link to="/license-plate">License Plate</Link>
        </nav>
        <Outlet />
    </div>
  );
}

export default App;
