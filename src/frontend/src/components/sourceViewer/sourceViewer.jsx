import React, { Component } from 'react';
import { Layout, Divider, Spin, Tree, Col, Row } from "antd";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createBrowserHistory } from 'history';
import { LoadingOutlined } from '@ant-design/icons';

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { DirectoryTree } = Tree;
const { Content, Sider } = Layout;

class SourceViewer extends Component {
    
    state = { 
        fetching: false,
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

            this.setState({
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
      };

    getPathFromUrl()
    {
        let sliceFromString = `/sourceviewer/`;
        let currentUrl = document.location.href;
        currentUrl = currentUrl.slice(currentUrl.indexOf(sliceFromString) + sliceFromString.length);
        return new Promise((resolve) => {resolve(currentUrl)})
    }

    async componentDidMount()
    {
        this.getTreeData();
        let urlFilePath = await this.getPathFromUrl();
        console.log(urlFilePath)
        if (urlFilePath.length > 0)
        {
            this.getFileData(urlFilePath);
        }
        if (this.state.fileSelected !== "")
        {
            console.log(this.state.fileSelected.split(".").slice(-1)[0]);
        }
    }

    render() { 
        return ( 
            <div style={{textAlign:"left"}} >
                
                <Divider><h2>{this.props.match.params.packageId} {this.state.fetching ? <Spin indicator={loadingIcon} /> : <></>}</h2></Divider>
                <Row>
                    <Col flex="none" style={{"background":"none","min-width":"20%"}}>
                        <div style={{ padding: '0 16px' }}>
                            <DirectoryTree
                                multiple
                                defaultExpandAll
                                onSelect={this.onSelect}
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