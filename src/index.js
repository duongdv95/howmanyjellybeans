import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const Index = () => <h2>Home</h2>;
const About = () => <h2>About</h2>;
         
class Users extends React.Component {
    state = {users: []}
  
    async componentDidMount() {
        const res = await fetch("/users")
        const users = await res.json();
        this.setState({users})
      fetch('/users')
        .then(res => res.json())
        .then(users => this.setState({ users }));
    }
  
    render() {
      return (
        <div className="Users">
          <h1>Users</h1>
          {this.state.users.map(user =>
            <div key={user.firstname}>{user.firstname} {user.lastname}</div>
          )}
        </div>
      );
    }
  }

class App extends React.Component {
    render() {
        return (
            <Router>
            <div>
            <nav>
                <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about/">About</Link>
                </li>
                <li>
                    <Link to="/users/">Users</Link>
                </li>
                </ul>
            </nav>

            <Route path="/" exact component={Index} />
            <Route path="/about/" component={About} />
            <Route path="/users/" component={Users} />
            </div>
            </Router>
        );
    }
    }

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  