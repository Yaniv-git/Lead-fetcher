import React, { Component } from "react";
import { Button, Typography, Alert, Row, Col, Divider, Collapse, Card, Space, Spin, Empty } from 'antd';
import { CaretRightOutlined, CodeOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { defaultStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {Link} from "react-router-dom"

const { Text } = Typography;
const { Panel } = Collapse;

class ScanAnalysis extends Component {
    state ={
      results: undefined,
      pieChartValues: [{
        type: 'no data',
        value: 0,
      }],
      columnChartValues: [
        {
          type: 'no data',
          value: 0,
          severity: "INFO"
        }
      ]
    }  

    async getData()
    {      
      //URI - results/npm/<package>/<version>
      let res = await fetch(`http://localhost:5000/api/v1/${this.props.match.params.lang}/${this.props.match.params.packageName}/${this.props.match.params.packageVersion}`,{ mode: 'cors'});
      if (res.status === 200)
      {

        let res_json = await res.json();

        let severityPieStatistics = undefined;
        let VulnerabilityColumnStatistics = undefined;

        if(res_json?.status !== "error")
        {
            severityPieStatistics = await this.getPieStatistics(res_json)
            VulnerabilityColumnStatistics = await this.getColumnStatistics(res_json)
            res_json.results = await this.sortResults(res_json.results)
            this.setState({
              results: res_json,
              pieChartValues: severityPieStatistics,
              columnChartValues: VulnerabilityColumnStatistics
            });
        }
        else{
          this.setState({
            results:res_json
          });
        }

        
        
      }
      else
      {
        this.setState({
          results:{status:"error",message:res.statusText}
        });
      }        
    }

    async getPieStatistics(res_json)
    {
      let severityPieStatistics = await res_json?.results.map((result) => {return result.extra.severity});
      severityPieStatistics = await severityPieStatistics.reduce((map, val) => {map[val] = (map[val] || 0)+1; return map}, {} );
      severityPieStatistics = await Object.keys(severityPieStatistics).map((severity) => {return {type: severity, value: severityPieStatistics[severity]}});
      return new Promise((resolve) => {resolve(severityPieStatistics);})
    } 

    async getColumnStatistics(res_json)
    {
      let VulnerabilityColumnStatistics = await res_json?.results.map((result) => {return {type:result.check_id.split(".").slice(-1)[0],severity:result.extra.severity}});
      VulnerabilityColumnStatistics = await VulnerabilityColumnStatistics.reduce((map, val) => {map[val.type] = [(map[val.type]?.[0] || 0)+1, val.severity]; return map}, {} );
      VulnerabilityColumnStatistics = await Object.keys(VulnerabilityColumnStatistics).map((vuln_type) => {return {type: vuln_type, value: VulnerabilityColumnStatistics[vuln_type][0], severity:VulnerabilityColumnStatistics[vuln_type][1]}});
      return new Promise((resolve) => {resolve(VulnerabilityColumnStatistics);})
    } 

    async sortResults(results)
    {
      
      await results.sort((firstNode, secondNode) => {
        if(firstNode?.extra?.severity === "ERROR" && (secondNode?.extra?.severity === "WARNING" || secondNode?.extra?.severity === "INFO")){return -1}
        if(firstNode?.extra?.severity === "WARNING" && secondNode?.extra?.severity === "INFO"){return -1}
        if(secondNode?.extra?.severity === "ERROR" && (firstNode?.extra?.severity === "WARNING" || firstNode?.extra?.severity === "INFO")){return 1}
        if(secondNode?.extra?.severity === "WARNING" && firstNode?.extra?.severity === "INFO"){return 1}
        return 0
      })
      
      return new Promise((resolve) => {resolve(results);})
    }

    componentDidMount(){
      this.getData()
    }


    render() {  
      
        if(this.state.results?.status === "error")
        {
          return (  
          <Empty description={
              <span>
                {this.state.results?.message}
              </span>
            }/>
          );
        }
         
        if (this.state.results === undefined)
        {
          return ( 
            <div>
              <Spin tip="Scanning...">
              </Spin>
            </div>
            );
        }

        if(this.state.results.results.length === 0)
        {
          return (  
          <Empty description={
              <span>
                No results
              </span>
            }/>
          );
        }
        const spaceStyle = {width:"100%"}
        const colors = {WARNING:'#ffe58f',ERROR:'#ffccc7',INFO:'#91d5ff',DEFAULT:'#91d5ff'}
        return ( 
          <div>
            <Space size={30} style={spaceStyle} direction="vertical">
              <Row>
                <Divider orientation="left">Statistics</Divider>
                <Col span={12}>
                  <Card title="Vulnerability Types">  
                    <Column data={this.state.columnChartValues} xField='type' yField='value'
                    colorField = 'severity'
                    color = {(severity) => {
                      if(colors.hasOwnProperty(severity)){
                        return colors[severity];
                      }
                      return colors.DEFAULT;
                    }}
                    label={{position: 'middle',style: {fill: '#FFFFFF',opacity: 0.6,},}}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Severity">
                    <Pie appendPadding={10} data={this.state.pieChartValues} angleField='value'
                            colorField='type'
                            color = {({type}) => { 
                              if(colors.hasOwnProperty(type)){
                                return colors[type];
                              }
                              return colors.DEFAULT;
                            }}
                            radius={0.8}
                            label={ {type: 'outer'} } interactions={[{ type: 'element-active' }]}/>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Divider orientation="left">Leads</Divider>
                  <Collapse
                    bordered={false}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse" style={{textAlign:"left"}}
                  >
                    {this.state.results?.results.map((lead, index) => {
                      return(
                        <Panel header={
                                <Row>
                                  <Col><Alert style={{width: "max-content"}} showIcon message={lead.check_id} type={lead.extra?.severity?.toLowerCase()}/></Col>
                                  <Col style={{position:"absolute",right:20, top:"25%",marginTop:"auto"}}>
                                    <Link to={`/sourceviewer/${this.props.match.params.lang}/${lead.path.substring(lead.path.lastIndexOf(`${this.props.match.params.packageName}-${this.props.match.params.packageVersion}`))}`}><Button  icon={<CodeOutlined />} /></Link>
                                  </Col>
                                </Row>
                              } key={index} className="site-collapse-custom-panel">

                          <div style={{marginRight:"45px",marginLeft:"45px"}}>  
                            <Space size={15} direction="vertical">
                              <h4>{lead.extra?.message}</h4>
                              <span>Path: <Text keyboard>{lead.path}</Text></span>
                              <SyntaxHighlighter wrapLongLines showLineNumbers startingLineNumber={lead.start.line}  language={window.extensionToLangConverter[lead.path.split(".").slice(-1)[0]]} style={defaultStyle}>
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
                </Col> 
              </Row>
            </Space>
          </div>
         );

         
    }
}
 
export default ScanAnalysis;