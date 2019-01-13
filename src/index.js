import React from "react";
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from './home.js';
import Instructions from './instructions.js';

const About = () => <h2>About</h2>;
const Users = () => <h3>users</h3>
         
class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/about/" component={About} />
                    <Route path="/users/" component={Users} />
                    <Route path="/instructions/" component={Instructions} />
                </Switch>
            </BrowserRouter>
        );
    }
    }

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  