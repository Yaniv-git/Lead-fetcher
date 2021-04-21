import React from 'react';
import { Button, Typography, Alert, Row, Col, Divider, Collapse, Space } from 'antd';
import { CaretRightOutlined, CodeOutlined } from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { defaultStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {Link} from "react-router-dom"


const { Text } = Typography;
const { Panel } = Collapse;

export function LeadsViewer(params)
{

    return(
        <Collapse
                bordered={false}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                className="site-collapse-custom-collapse" style={{textAlign:"left"}}
              >
            {params.results.map((lead, index) => {
                  return(
                    <Panel header={
                        <Row>
                        <Col><Alert style={{width: "max-content", "max-width": "100%"}} showIcon message={lead.check_id} type={lead.extra?.severity?.toLowerCase()}/></Col>
                        <Col style={{position:"absolute",right:20, top:"25%",marginTop:"auto"}}>
                            <Link to={`/sourceviewer/${lead.path.substring(lead.path.lastIndexOf(`${params.lang}`))}#${lead.start.line}`}><Button  icon={<CodeOutlined />} /></Link>
                        </Col>
                        </Row>
                    } key={index} className="site-collapse-custom-panel">

                        <div style={{marginRight:"45px",marginLeft:"45px"}}>  
                            <Space size={15} direction="vertical" style={{ "max-width": "100%"}}>
                            <h4>{lead.extra?.message}</h4>
                            <span>Path: <Text keyboard>{lead.path}</Text></span>
                            <SyntaxHighlighter  showLineNumbers startingLineNumber={lead.start.line}  language={window.extensionToLangConverter[lead.path.split(".").slice(-1)[0]]} style={defaultStyle}>
                                {lead.extra?.lines}
                            </SyntaxHighlighter>
                            </Space>
                            <Divider plain>CWE</Divider>   
                            <span>{lead.extra?.metadata?.cwe}</span>
                        </div> 

                    </Panel>
            );
            })}
        </Collapse>
    );

}

export default LeadsViewer