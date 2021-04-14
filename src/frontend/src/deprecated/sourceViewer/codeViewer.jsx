import React, { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { defaultStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';


class CodeViewer extends Component {
    state = { 
        fileCode: "ads"
    }
    render() { 
        return ( 
        <div>
            <SyntaxHighlighter wrapLongLines showLineNumbers language="javascript" style={defaultStyle}>
                {this.state.fileCode}
            </SyntaxHighlighter>
            {JSON.stringify(this.props.match)}
        </div> );
    }
}
 
export default CodeViewer;