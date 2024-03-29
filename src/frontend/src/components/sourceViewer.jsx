import React, { useState, useEffect } from 'react';
import { Divider, Spin, Tree, Col, Row } from "antd";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createBrowserHistory } from 'history';
import { LoadingOutlined } from '@ant-design/icons';
import { fetchFileTreeData, fetchFileData } from "../apiHandler.js";
import { useParams } from "react-router-dom";

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { DirectoryTree } = Tree;


function SourceViewer()
{
    const [fetching, setFetching] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [fileData, setFileData] = useState("");
    const [fileSelected, setFileSelected] = useState("");
    const { lang, packageId } = useParams();
    let history = createBrowserHistory();

    const getRestOfUrl = (sliceFromString) =>
    {
        let currentUrl = decodeURIComponent(document.location.href);
        currentUrl = currentUrl.slice(currentUrl.indexOf(sliceFromString) + sliceFromString.length);
        return new Promise((resolve) => {resolve(currentUrl)})
    }

    const getTreeSelectedValues = (tree, path, expandedKeys = [], selectedKeys = []) =>
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
                return getTreeSelectedValues(tree[i]["children"], path, expandedKeys, selectedKeys)        
            }
        }   
        return new Promise((resolve) => {resolve([expandedKeys,selectedKeys])})   
    }

    const getTreeData = async () =>
    {
        fetchFileTreeData(lang, packageId).then(async (res_json) => {
            let filePath = await getRestOfUrl(`sourceviewer/${lang}/${packageId}/`);
            let [expandedKeys, selectedKeys] = await getTreeSelectedValues(res_json, filePath);
            setExpandedKeys(expandedKeys);
            setSelectedKeys(selectedKeys);
            setTreeData(res_json);
        });
    }

    const getFileData = async(filePath) =>
    {
        setFetching(true);
        fetchFileData(filePath).then(async (res_json) => {
            setFetching(false);
            setFileData(res_json.data);
            setFileSelected(filePath.split("/").slice(-1)[0]);
        });
    }

    const onSelect = (keys, info) => {
        if (info.node?.isLeaf) {
            getFileData(`${lang}/${packageId}${info.node?.path}/${info.node?.title}`);
            history.push(`/sourceviewer/${lang}/${packageId}${info.node?.path}/${info.node?.title}`);
        }
        setSelectedKeys([info.node.key]);
    };

    useEffect(async() => 
    {
        getTreeData();
        let urlFilePath = await getRestOfUrl(`/sourceviewer/`);
        if (urlFilePath.length > 0)
        {
            getFileData(urlFilePath);
        }  
    }, [])

    return ( 
        <div style={{textAlign:"left"}} >
            
            <Divider><h2>{packageId} {fetching ? <Spin indicator={loadingIcon} /> : <></>}</h2></Divider>
            <Row>
                <Col flex="none" style={{"min-width":"20%"}}>
                    <div style={{ padding: '0 16px' }}>
                        <DirectoryTree style={{"background":"#f0f2f5"}}                          
                            expandedKeys={expandedKeys}
                            selectedKeys={selectedKeys}
                            onSelect={onSelect}
                            onExpand={(expandedKeysValue) => {setExpandedKeys(expandedKeysValue);}}
                            treeData={treeData}
                        />
                    </div>
                </Col>
                <Col flex="auto" style={{"max-width":"80%"}}>
                
                        {fileSelected !== "" ? (<SyntaxHighlighter wrapLines showLineNumbers language={window.extensionToLangConverter[fileSelected.split(".").slice(-1)[0]]} style={androidstudio}>
                            {fileData}
                        </SyntaxHighlighter>) : <></>}
                    
                </Col>
            </Row>
        </div>
     );
}

export default SourceViewer;