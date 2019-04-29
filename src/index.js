import React from "react";
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from './home.js';
import Game from './game.js';
import Instructions from './instructions.js';
import Unauthorized from './unauthorized.js';
import About from './about.js';
import Invalid from "./invalid.js";

class App extends React.Component {
    render() {
        return (
            //forceRefresh={true}
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/instructions/" component={Instructions} />
                    <Route exact path="/about/" component={About} />
                    <Route path="/unauthorized/" component={Unauthorized} />
                    <Route path="/invalidaccesscode/" component={Invalid} />
                    <Route exact path="/:id" component={Game} />
                </Switch>
            </BrowserRouter>
        );
    }
    }

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  