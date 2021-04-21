import React, { useEffect, useState } from "react";
import { Row, Col, Divider, Card, Space, Spin, Empty } from 'antd';
import { useParams } from "react-router-dom";
import { ColumnChart } from "./statistics/columnChart.jsx";
import { PieChart } from "./statistics/pieChart.jsx";
import { LeadsViewer } from "./leadsViewer.jsx";
import { fetchScan } from "../../apiHandler.js";


function ScanResultViewer()
{
    const [results, setResults] = useState({status:"loading"});
    const colors = {WARNING:'#ffe58f',ERROR:'#ffccc7',INFO:'#91d5ff',DEFAULT:'#91d5ff'};
    const { lang, packageName, packageVersion } = useParams();

    const getResultsData = async () =>
    {
      fetchScan(lang, packageName, packageVersion).then
      ( async (res_json) =>
          {
            if(res_json?.status !== "error")
            {
              res_json.results = await sortResults(res_json.results);
              setResults({results:res_json.results});
            }
            else
            {
              setResults(res_json);
            }
          }
      );          
    }

    const sortResults = async(results) =>
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

    useEffect(() => {      
      getResultsData();
      }, [])
      
    if(results?.status === "error")
    {
      return (  
      <Empty description={
          <span>
            {JSON.stringify(results?.message)}
          </span>
        }/>
      );
    }
      
    if (results?.status === "loading")
    {
      return ( 
        <div>
          <Spin tip="Scanning...">
          </Spin>
        </div>
        );
    }

    if(results.results.length === 0)
    {
      return (  
      <Empty description={
          <span>
            No results
          </span>
        }/>
      );
    }
    return ( 
      <div>
        <Space size={30} style={{width:"100%"}} direction="vertical">
          <Row>
            <Divider orientation="left">Statistics</Divider>
            <Col span={12}>
              <Card title="Vulnerability Types">  
                <ColumnChart colors={colors} resultsData={results}/>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Severity">
                <PieChart colors={colors} resultsData={results}/>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Divider orientation="left">Leads</Divider>
              <LeadsViewer results={results?.results}  lang={lang}/>
            </Col> 
          </Row>
        </Space>
      </div>
      );
}             

export default ScanResultViewer;