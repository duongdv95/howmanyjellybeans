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
                        <h2>Fundraising Events</h2>
                        <p>Organizing a jellybean guessing contest is a great way to raise money for any cause.
                            With the help of this web app, participants can easily submit their guesses.
                            And <strong>YOU</strong>, the host, can sort through the winners with a click of 
                            a button. These are some things you'll need to get started!
                        </p>
                        <ul>
                                <li>
                                    Big bag of jellybeans or hershey kisses
                                </li>
                                <li>
                                    Two Jar, Vase, or clear container
                                </li>
                                <li>
                                    Table, paper, tape, felt pen
                                </li>
                        </ul>
                        <p>
                            If you feel like 
                        </p>
                        <p>
                            You will want to count exactly how many jellybeans that will go in the jar 
                            and write it down somewhere you won't forget! 
                        </p>
                        <p>
                            Next, go to <Link to={"/"} target="_blank">howmanyjellybeans</Link>. Create a
                            game and submit your host name and winning number. 
                        </p>
                        <p>
                            Write <strong>www.howmanyjellybeans.com/XXXXXX </strong>
                            replacing the XXXXXX with the access code on the paper so players can request to join
                            on their mobile phone. 
                        </p>
                        <p>
                            Now you have one jar with jellybeans and another jar for collecting the entry fee.
                            Participants can pay a fee to join and you can approve them once they've paid.
                        </p>
                        <p>
                            When you want to end the fundraiser, click 
                            <strong> End Game </strong> to automatically rank players. You can decide how to 
                            award the winner(s).
                        </p>
                    </div>
                    <div>
                        <h2>Work or Family Events</h2>
                        <p>
                            Hosting for work or family events is exactly the same as fundraising. The collected 
                            money can all go to the winner or however you decide.
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