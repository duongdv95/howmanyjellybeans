import React from "react";
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
                        or have a fun activity at a work or family gathering.
                        With the help of this web app, participants can easily submit their guesses.
                        And you, the host, can sort through the winners with a click of 
                        a button. These are some things you'll need to get started! (Amazon Affiliate links below)
                    </p>
                    <ul>
                        <li>
                            Big bag of <a href="https://amzn.to/2DS4FyF" target="_blank" rel="noopener noreferrer">jellybeans</a> 
                            <span> </span> or <a href="https://amzn.to/2JjFokE" target="_blank" rel="noopener noreferrer">hershey kisses</a>
                        </li>
                        <li>
                            <a href="https://amzn.to/2VjkJEp" target="_blank" rel="noopener noreferrer">Two Jars</a>
                            <span> </span> to display the jellybeans and collect the entry fee
                        </li>
                        <li>
                            <a href="https://amzn.to/2POVrYZ" target="_blank" rel="noopener noreferrer">Table</a>
                        </li>
                    </ul>
                    <p>
                        Count exactly how many jellybeans that will go in the jar 
                        and save it somewhere so you won't forget.
                    </p>
                    <p>
                        Next, go to <a href="/" target="_blank">howmanyjellybeans</a>. Create a
                        game and submit your host name and winning number. Record the access code.
                    </p>
                    <p>
                        Print sign up sheets <a href="/signupsheet" target="_blank">here</a> and
                        fill in the access code on the sheet: www.howmanyjellybeans/XXXXXX. Have participants 
                        go to the URL on the sign up sheet and submit their name and guess on the website and
                        on paper! (in case the website goes down)
                    </p>
                    <p>
                        Now you have one jar with jellybeans and another jar for collecting the entry fee.
                        Charge participants a fee to join and you can approve them once they've paid.
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
                    <p>
                        Doing a test-run is recommended to get familiar with the
                        web app.
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