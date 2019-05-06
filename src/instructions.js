import React from "react";
import {Link} from "react-router-dom";
import Footer from './footer.js';

function HowToPlay() {
    return (
    <React.Fragment>
        <div id="instructions" className="grid">
            <div className="content-wrap">
                <h2>How to organize an event</h2>
                <div>
                    <h2>Fundraising / Work / Family Events</h2>
                    <p>Organizing a jellybean guessing contest is a great way to raise money for a fundraiser
                        or have a fun activity at a work or family event.
                        With the help of this web app, participants can easily submit their guesses.
                        And you, the host, can sort through the winners with a click of 
                        a button. These are some things you'll need to get started!
                    </p>
                    <ul>
                        <li>
                            Big bag of jellybeans or hershey kisses
                        </li>
                        <li>
                            First jar for jellybeans
                        </li>
                        <li>
                            Second jar for entry fee
                        </li>
                        <li>
                            Table
                        </li>
                    </ul>
                    <p>
                        Count exactly how many jellybeans that will go in the jar 
                        and save it somewhere so you won't forget.
                    </p>
                    <p>
                        Next, go to <Link to={"/"} target="_blank">howmanyjellybeans</Link>. Create a
                        game and submit your host name and winning number. Record the access code.
                    </p>
                    <p>
                        Print sign up sheets <Link to={"/signupsheet"} target="_blank">here</Link> and
                        fill in the access code on the sheet: www.howmanyjellybeans/XXXXXX. Have participants 
                        go to the URL on the sign up sheet and submit their name and guess on the website and
                        on paper! (in case the website goes down)
                    </p>
                    <p>
                        Now you have one jar with jellybeans and another jar for collecting the entry fee.
                        Participants can pay a fee to join and you can approve them once they've paid.
                    </p>
                    <p>
                        <strong>
                            NOTE: Only approved players will get ranked! So be sure to approve participants
                            BEFORE ending the game.
                        </strong>
                    </p>
                    <p>
                        When you want to end the contest, click 
                        <strong> End Game </strong> to get the player rankings. You can decide how to 
                        award the winner(s). Typically the winner would get the jar of jellybeans
                        but you can give additional prizes (gift cards, gift baskets, entry fee jar).
                    </p>
                </div>
            </div>
        </div>
        <Footer/>
    </React.Fragment>
    )
}

class Instructions extends React.Component {
    render() {
        return (
            <HowToPlay/>
        )
    }
}

export default Instructions