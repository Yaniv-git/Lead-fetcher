import React, { Component } from "react";
import { Typography, Alert, Row, Col, Divider, Collapse, Card, Space, Spin, Empty } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';

const { Text } = Typography;
const { Panel } = Collapse;

class ScanAnalysis extends Component {
    state ={
      loaded: false,
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
      if (!this.state.loaded)
        {
          //results/npm/<package>/<version>
          let current_url = new URL(document.location.href)
          let res = await fetch(`http://localhost:5000/api/v1/${current_url.pathname.replace("/results/","")}`,{ mode: 'cors'});
          if (res.status === 200)
          {

            let res_json = await res.json();

            let severityPieStatistics = await res_json?.results.map((result) => {return result.extra.severity})
            severityPieStatistics = await severityPieStatistics.reduce((map, val) => {map[val] = (map[val] || 0)+1; return map}, {} );
            severityPieStatistics = await Object.keys(severityPieStatistics).map((severity) => {return {type: severity, value: severityPieStatistics[severity]}})

            let VulnerabilityColumnStatistics = await res_json?.results.map((result) => {return {type:result.check_id.split(".").slice(-1)[0],severity:result.extra.severity}})
            VulnerabilityColumnStatistics = await VulnerabilityColumnStatistics.reduce((map, val) => {map[val.type] = [(map[val.type]?.[0] || 0)+1, val.severity]; return map}, {} );
            VulnerabilityColumnStatistics = await Object.keys(VulnerabilityColumnStatistics).map((vuln_type) => {return {type: vuln_type, value: VulnerabilityColumnStatistics[vuln_type][0], severity:VulnerabilityColumnStatistics[vuln_type][1]}})
            
            this.setState({
              loaded: true,
              results: res_json,
              pieChartValues: severityPieStatistics,
              columnChartValues: VulnerabilityColumnStatistics
            });
          }
          else
          {
            this.setState({
              results:{status:"error",message:res.statusText}
            });
          }
        }
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
                                <div><Alert style={{width: "max-content"}} showIcon message={lead.check_id} type={lead.extra?.severity?.toLowerCase()}/></div>
                              } key={index} className="site-collapse-custom-panel">
                          <div style={{marginRight:"45px",marginLeft:"45px"}}>  
                            <h4>{lead.extra?.message}</h4>
                            <span>Path: <Text keyboard>{lead.path}</Text></span>
                            <p><Text code>{lead.start.line}| {lead.extra?.lines}</Text></p>
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