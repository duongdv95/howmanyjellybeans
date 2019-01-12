import React from "react";

// Components Hierarchy
// -HOME
//    -IMG
//    -OPTIONS [user inputs]
//        -NEW GAME    
//        -JOIN GAME    
//    -Instructions
 
class Home extends React.Component {
    render() {
        return (
            <div>
                <img src={"https://images.unsplash.com/photo-1519687079572-8a59631f3685?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80"} height="300" width="400" alt="MERP"/>
                <h1>How many jelly beans??</h1>
            </div>
        )
    }
}

export default Home