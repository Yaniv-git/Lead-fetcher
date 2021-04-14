import React, {useEffect, useState} from 'react';
import { Divider, Col, Row, Space, Empty } from "antd";
import { DownloadedPackageCard } from "./downloadedPackageCard.jsx"
import { fetchPackagesData } from "../apiHandler.js";



function DownloadedPackageViewer()
{
    const [packages, setPackages] = useState({
        status:"",
        results:{}
    })

    const sortResults = async (results) =>
    {
      await results.sort((firstNode, secondNode) => {
        if(firstNode?.ERROR > secondNode?.ERROR || (firstNode?.ERROR && !secondNode?.ERROR)){return -1}
        if(firstNode?.WARNING > secondNode?.WARNING || (firstNode?.WARNING && !secondNode?.WARNING)){return -1}
        if(firstNode?.INFO > secondNode?.INFO){return -1} 
        if(firstNode?.ERROR < secondNode?.ERROR || (!firstNode?.ERROR && secondNode?.ERROR)){return 1}
        if(firstNode?.WARNING < secondNode?.WARNING || (!firstNode?.WARNING && secondNode?.WARNING)){return 1}
        if(firstNode?.INFO < secondNode?.INFO){return 1}
        return 0
      })
      return new Promise((resolve) => {resolve(results);})
    }

    const getData = () =>
    {
        fetchPackagesData().then
        ( async (res_json) =>
            {
                await Object.keys(res_json.results).map((lang) => {
                    return sortResults(res_json.results[lang]);
                }) 
                setPackages(res_json);
            }
        );
    }

    useEffect(() => {getData()}, [])

    return ( 
        <div>
            <Row style={{ textAlign: 'left' }} gutter={25}>               
                {Object.keys(packages.results).map((lang) => {
                    if (packages.results[lang].length === 0){
                        return (
                            <Col span={24 / Object.keys(packages.results).length}>
                                <Divider orientation="left">{lang}</Divider>
                                <Empty description={
                                <span>
                                No Scans
                                </span>
                                }/>
                            </Col>)
                    }

                    return (                
                        <Col span={24 / Object.keys(packages.results).length}>
                                <Divider orientation="left">{lang}</Divider>
                                <Space size={12} direction="vertical" style={{ width: "100%" }}>
                                {packages.results[lang].map((packageResult) => {
                                    return (
                                        <DownloadedPackageCard package={packageResult.package} lang={lang} status={packageResult?.status} licenses={packageResult?.licenses} ERROR={packageResult?.ERROR} INFO={packageResult?.INFO} WARNING={packageResult?.WARNING}/>         
                                    )
                                    })}
                                </Space>
                        </Col>     
                    )
                })}
            </Row>
        </div> 
     );
}

export default DownloadedPackageViewer;