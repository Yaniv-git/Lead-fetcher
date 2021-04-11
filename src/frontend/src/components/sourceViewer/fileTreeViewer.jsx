import React, {Component} from 'react';
import { Tree } from "antd";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { defaultStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createBrowserHistory } from 'history';

const { DirectoryTree } = Tree;



class FileTreeViewer extends Component {
    state = { 
        treeData: [],
        codeData: "ads"
     }

    async getTreeData()
    {
        // /api/v1/sourceview/<lang>/<pacakge_id>
        let res = await fetch(`http://localhost:5000/api/v1/sourceview/${this.props.match.params.lang}/${this.props.match.params.packageId}`,{ mode: 'cors'});
        if (res.status === 200)
        {
            let res_json = await res.json();

            this.setState({
                treeData: res_json
            });
        }
    }
    
    stateChange = (key,val) => {
        this.setState({
            [key]: val,
        });
    }

    onSelect = (keys, info) => {
        let history = createBrowserHistory();
        if (info.node?.isLeaf) {
            console.log(`${info.node?.path}/${info.node?.title}`);
            //handleClick(`/sourceviewer/${this.props.match.params.lang}/${this.props.match.params.packageId}${info.node?.path}/${info.node?.title}`);
            history.push(`/sourceviewer/${this.props.match.params.lang}/${this.props.match.params.packageId}${info.node?.path}/${info.node?.title}`);
        }
      };

    componentDidMount()
    {
        this.getTreeData();
    }

    render() { 
        return ( 
            
            <div style={{textAlign:"left"}}>
            <DirectoryTree
                multiple
                defaultExpandAll
                onSelect={this.onSelect}
                treeData={this.state.treeData}
            />
            
            <SyntaxHighlighter wrapLongLines showLineNumbers language="javascript" style={defaultStyle}>
                {this.state.fileCode}
            </SyntaxHighlighter>
            {JSON.stringify(this.props.match)}
        </div> 
        );
    }
}
 
export default FileTreeViewer;