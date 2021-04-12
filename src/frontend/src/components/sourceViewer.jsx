import React, { Component } from 'react';
import { Divider, Spin, Tree, Col, Row } from "antd";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createBrowserHistory } from 'history';
import { LoadingOutlined } from '@ant-design/icons';

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { DirectoryTree } = Tree;

class SourceViewer extends Component {
    
    state = { 
        fetching: false,
        selectedKeys: [],
        expandedKeys: [],
        treeData: [],
        fileData: "",
        fileSelected: ""
     }

    async getTreeData()
    {
        // /api/v1/sourceview/<lang>/<pacakge_id>
        let res = await fetch(`http://localhost:5000/api/v1/sourceview/${this.props.match.params.lang}/${this.props.match.params.packageId}`,{ mode: 'cors'});
        if (res.status === 200)
        {
            let res_json = await res.json();
            let filePath = await this.getRestOfUrl(`sourceviewer/${this.props.match.params.lang}/${this.props.match.params.packageId}/`);
            
            let [expandedKeys, selectedKeys] = await this.getTreeSelectedValues(res_json, filePath)
            this.setState({
                expandedKeys: expandedKeys,
                selectedKeys: selectedKeys,
                treeData: res_json
            });
        }
    }
    
    async getFileData(filePath)
    {
        this.setState({
            fetching: true
        });
        let res = await fetch(`http://localhost:5000/api/v1/file/${filePath}`)
        if (res.status === 200)
        {
            let res_json = await res.json();
            this.setState({
                fetching: false,
                fileData: res_json.data,
                fileSelected: filePath.split("/").slice(-1)[0]
            });
        }
    }

    async getTreeSelectedValues(tree, path, expandedKeys = [], selectedKeys = [])
    {
        let firstFile = path
        if (path.indexOf("/") > -1)
        {
            firstFile = path.substring(0,path.indexOf("/"))
        }
        path = path.substring(path.indexOf("/")+1)
        for(let i=0; i<tree.length;i++)
        {
            if (tree[i]["title"] === firstFile)
            {
                if(tree[i]?.isLeaf)
                {
                    selectedKeys.push(tree[i]["key"])
                    return new Promise((resolve) => {resolve([expandedKeys,selectedKeys])})
                }
                else
                {
                    expandedKeys.push(tree[i]["key"])
                }
                return this.getTreeSelectedValues(tree[i]["children"], path, expandedKeys, selectedKeys)        
            }
        }   
        return new Promise((resolve) => {resolve([expandedKeys,selectedKeys])})   
    }

    stateChange = (key,val) => {
        this.setState({
            [key]: val,
        });
    }

    onSelect = (keys, info) => {
        let history = createBrowserHistory();
        if (info.node?.isLeaf) {
            this.getFileData(`${this.props.match.params.lang}/${this.props.match.params.packageId}${info.node?.path}/${info.node?.title}`);
            history.push(`/sourceviewer/${this.props.match.params.lang}/${this.props.match.params.packageId}${info.node?.path}/${info.node?.title}`);
        }
        this.setState({
            selectedKeys: [info.node.key]
        });
      };

    getRestOfUrl(sliceFromString)
    {
        let currentUrl = document.location.href;
        currentUrl = currentUrl.slice(currentUrl.indexOf(sliceFromString) + sliceFromString.length);
        return new Promise((resolve) => {resolve(currentUrl)})
    }

    async componentDidMount()
    {
        this.getTreeData();
        let urlFilePath = await this.getRestOfUrl(`/sourceviewer/`);
        if (urlFilePath.length > 0)
        {
            this.getFileData(urlFilePath);
        }
        if (this.state.fileSelected !== "")
        {
            console.log(this.state.fileSelected.split(".").slice(-1)[0]);
        }
    }
    
    onExpand = (expandedKeysValue) => {
        this.setState({
            expandedKeys: expandedKeysValue
        });
    };


    render() { 
        return ( 
            <div style={{textAlign:"left"}} >
                
                <Divider><h2>{this.props.match.params.packageId} {this.state.fetching ? <Spin indicator={loadingIcon} /> : <></>}</h2></Divider>
                <Row>
                    <Col flex="none" style={{"min-width":"20%"}}>
                        <div style={{ padding: '0 16px' }}>
                            <DirectoryTree style={{"background":"#f0f2f5"}}                          
                                expandedKeys={this.state.expandedKeys}
                                selectedKeys={this.state.selectedKeys}
                                onSelect={this.onSelect}
                                onExpand={this.onExpand}
                                treeData={this.state.treeData}
                            />
                        </div>
                    </Col>
                    <Col flex="auto" style={{"max-width":"80%"}}>
                    
                            {this.state.fileSelected !== "" ? (<SyntaxHighlighter wrapLines showLineNumbers language={window.extensionToLangConverter[this.state.fileSelected.split(".").slice(-1)[0]]} style={androidstudio}>
                                {this.state.fileData}
                            </SyntaxHighlighter>) : <></>}
                        
                    </Col>
                </Row>
            </div>
         );
    }
}
 
export default SourceViewer;