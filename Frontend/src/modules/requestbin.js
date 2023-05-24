import React from 'react';
const { exec } = require('child_process');

class RequestBin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            command: '',
            result: ''
        };
    }

    handleChange = (event) => {
        this.setState({ command: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();

        // Execute the command using the exec function
        exec(this.state.command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            this.setState({ result: stdout });
        });
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handle.eSubmit}>
                    <label>
                        Command:
                        <input type="text" value={this.state.command} onChange={this.handleChange} />
                    </label>
                    <button type="submit">Execute</button>
                </form>
                <div>{this.state.result}</div>
            </div>
        );
    }
}

export default RequestBin;
