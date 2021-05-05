import React, { useState } from 'react';
import { Popconfirm, Card, Col, Row, Space, Alert, Spin } from "antd";
import {Link} from "react-router-dom"
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, CodeOutlined, DashboardOutlined, LoadingOutlined } from '@ant-design/icons';
import { deleteScanRequest } from "../apiHandler.js";

const { Meta } = Card;

export function DownloadedPackageCard(cardData)
{

    const [isDeleted, setIsDeleted] = useState(false);

    const checkIfLicenseAllowed = (licenses) =>
    {
        for (var j = 0; j < licenses?.length; j++)
        {
            for (var i = 0; i < window.allowedLicences.length; i++) {
                if(licenses[j]?.indexOf(window.allowedLicences[i]) > -1) 
                {
                    return true;
                }
            }
        }
        return false;
    }

    const deleteScan = (lang, packageId) =>
    {
        deleteScanRequest(lang, packageId).then
        ( () =>
            {setIsDeleted(true);}
        );
    }

    if(isDeleted)
    {
        return(<></>);
    }

    return ( 
        <Card 
            actions={[                                                                
                (<Link key={`dashboard-${cardData.package}`} to={`/results/${cardData.lang}/${cardData.package.substring(0,cardData.package.lastIndexOf('-'))}/${cardData.package.substring(cardData.package.lastIndexOf('-')+1)}`}>
                <DashboardOutlined key="edit" />
                </Link>),
                (<Link key={`sourceviewer-${cardData.package}`} to={`/sourceviewer/${cardData.lang}/${cardData.package}`}>
                <CodeOutlined key="setting" />
                </Link>),
                (
                <Popconfirm
                    title="Are you sure to delete this scan?"
                    onConfirm={() => {if(cardData?.status !== "loading"){deleteScan(cardData.lang, cardData.package)}}}
                    okText="Yes"
                    cancelText="No"
                  ><DeleteOutlined key="ellipsis"/></Popconfirm>
                ),
            ]}
        >
            <Meta
            title={
                <Row>
                    <Col>{cardData.package}</Col>
                    <Col style={{position:"absolute",right:20, top:"10%",marginTop:"auto"}}>
                        <Space direction="horizontal">
                            {cardData?.ERROR ? <Alert style={{width: "max-content"}} showIcon message={cardData.ERROR} type="error"/>: undefined }
                            {cardData?.WARNING ? <Alert style={{width: "max-content"}} showIcon message={cardData.WARNING} type="warning"/>: undefined }
                            {cardData?.INFO ? <Alert style={{width: "max-content"}} showIcon message={cardData.INFO} type="info"/>: undefined }
                            {cardData?.status === "loading" ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>}/>: undefined }
                        </Space>
                    </Col>
                </Row>}
            description = {
                checkIfLicenseAllowed(cardData?.licenses) ? 
                (<span><CheckCircleTwoTone twoToneColor="#52c41a" /> {cardData?.licenses.toString()}</span>):
                (<span><CloseCircleTwoTone twoToneColor="#eb2f2f" /> {cardData?.licenses.toString()}</span>)                                                            
            }                                                            
            />
        </Card>
    );

}

export default DownloadedPackageCard;
