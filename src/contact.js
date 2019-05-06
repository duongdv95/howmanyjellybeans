import React from "react";
import Footer from './footer.js';

class Contact extends React.Component {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this.state = {
            copyButtonText: "Copy"
        }
    }

    copyToClipboard = (e) => {
        this.textArea.select()
        document.execCommand("copy")
        this.setState({copyButtonText: "Copied!"})
    }

    render() {
        return (
        <React.Fragment>
            <div id="contact" className="grid">
                <div className="content-wrap">
                    <h2>Contact</h2>
                    <div>
                        If you find any bugs or have any suggestions, I can be reached at my email below. 
                            <div id="emailContact">
                                <i className="fas fa-envelope"></i>
                                <input 
                                type="text" 
                                id="email" 
                                value="dvduong13@gmail.com" 
                                readOnly="readonly"
                                ref={(textarea) => this.textArea = textarea}
                                ></input>
                                <button onClick={this.copyToClipboard} className="btn-light">
                                <i className="far fa-copy"></i>
                                <span>{this.state.copyButtonText}</span>
                                </button>
                        </div>
                    </div>
                </div>
            </div>
        <Footer/>
        </React.Fragment>
    )
    }
}

export default Contact