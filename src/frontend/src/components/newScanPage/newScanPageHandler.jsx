import React from 'react';
import { Tabs } from 'antd';
import { ZoomInOutlined, EditOutlined } from '@ant-design/icons';
import NewScanForm from './newScanForm.jsx';
import SearchPackagesByKeyword from './searchPackagesByKeyword.jsx';

const { TabPane } = Tabs;

function NewScanPageHandler()
{
    return(
        <Tabs defaultActiveKey="1">
            <TabPane
            tab={
                <span>
                <EditOutlined />
                Names
                </span>
            }
            key="1"
            >
                <NewScanForm/>
            </TabPane>
            <TabPane
            tab={
                <span>
                <ZoomInOutlined />
                Keyword
                </span>
            }
            key="2"
            >
                <SearchPackagesByKeyword/>
            </TabPane>
        </Tabs>
    );
}

export default NewScanPageHandler;