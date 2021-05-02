import React, { useState, useEffect } from 'react';
import { Radio, message, Table, Button, Input, Col, Row } from 'antd';
import { fetchNpmKeyword, fetchScan } from "../../apiHandler.js";

const { Column, ColumnGroup } = Table;
const { Search } = Input;
 

function SearchPackagesByKeyword()
{
    const [currentPagination, setCurrentPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [tableLoading, setTableLoading] = useState(false);
    const [keyword, setKeyword] = useState();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [tableData, setTableData] = useState([]);
    const hasSelected = selectedRowKeys.length > 0;
    const [radioState, setRadioState] = useState("npm");

    const showLoadingMessage = (messageText, duration) =>
    {
        const hide = message.loading(messageText, 0);
        setTimeout(hide, duration);
    }
    
    const scanPackages = () => {
      showLoadingMessage(`Scanning ${selectedRowKeys.length} packages`, 2500);
      for(let selectedPackage in selectedRowKeys)
      {
        fetchScan(radioState, selectedRowKeys[selectedPackage]);
      }
    }

    
    
    const getKeywordData = async(pagination = currentPagination) => {    
      setTableLoading(true);
      if (radioState === "npm")
      {
        let res = await fetchNpmKeyword(keyword, pagination.current, pagination.pageSize);
        setTableData(res.data.objects);
        setCurrentPagination({
          current: res.data.pagination.page,
          pageSize: res.data.objects.length,
          total: res.data.total,
        });
        setTableLoading(false);
      }
    }

    useEffect(() => {
      getKeywordData();
    }, [keyword])

    return(                  
        <Table rowKey={record => record.package.name} rowSelection={{selectedRowKeys, onChange:(selectedKeys) =>{setSelectedRowKeys(selectedKeys)}}} 
        dataSource={tableData} pagination={currentPagination} loading={tableLoading} onChange={(selectedPagination) => {getKeywordData(selectedPagination);}}>
            <ColumnGroup title={
              <Row>   
                <Col flex="auto" style={{textAlign:"left"}}>  
                  <Radio.Group onChange={(e)=>{setRadioState(e.target.value);}} value={radioState}>
                      <Radio value="npm">NPM</Radio>
                      <Radio value="pip" disabled>PIP</Radio>
                  </Radio.Group> 
                </Col>
                <Col flex="auto" style={{textAlign:"left"}}>                  
                  <Search onSearch={(input) => {setKeyword(input);}} placeholder="Keyword"/>
                </Col>
                <Col flex="auto" style={{textAlign:"right"}}>
                  <Button type="primary" onClick={() => {scanPackages()}} disabled={!hasSelected}>
                    Scan
                  </Button>
                </Col>
              </Row>
              }>

              <Column title="Package name" key="package" render={(text, record) => {
                  record.key = record.package.name;
                  return (<a href={record.package.links.npm} target="_blank" rel="noreferrer noopener">{record.package.name}</a>);                
              }}/>

              <Column title="Description" key="description" render={(text, record) => {
                  return record.package.description;             
              }}/>

              <Column title="Last update" key="lastupdate" render={(text, record) => {
                  return record.package.date.rel;             
              }}/>

            </ColumnGroup>
        </Table>                  
    );

}


export default SearchPackagesByKeyword