import {Badge, Descriptions, Drawer, Row, Table, Tabs} from "antd";
import React, {useEffect, useState} from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {vs2015} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import CodeEditor from "@/components/Postman/CodeEditor";
import TreeXmind from "@/components/G6/TreeXmind";
import {queryXmindData} from "@/services/testcase";
import auth from "@/utils/auth";
import NoRecord from "@/components/NotFound/NoRecord";
import IconFont from "@/components/Icon/IconFont";

const TabPane = Tabs.TabPane;
const STATUS = {
  200: {color: '#67C23A', text: 'OK'},
  401: {color: '#F56C6C', text: 'unauthorized'},
  400: {color: '#F56C6C', text: 'Bad Request'},
};
const resColumns = [
  {
    title: 'KEY',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'VALUE',
    dataIndex: 'value',
    key: 'value',
  },
];
export default ({response, caseName, width, modal, setModal}) => {

  const [xmindData, setXmindData] = useState(null);
  const [graph, setGraph] = useState(null);

  const getBrain = async () => {
    const res = await queryXmindData({case_id: response.case_id})
    if (auth.response(res)) {
      setXmindData(res.data)
    }
  }

  useEffect(async () => {
    if (response.case_id !== undefined) {
      await getBrain();
    }
  }, [response])

  const toTable = (field) => {
    if (response[field] === null || response[field] === undefined || response[field] === '{}') {
      return [];
    }
    const temp = JSON.parse(response[field]);
    return Object.keys(temp).map((key) => ({
      key,
      value: temp[key],
    }));
  };

  const assertTable = [
    {
      title: '断言信息',
      key: 'msg',
      dataIndex: 'msg'
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: text => <Badge status={text ? 'success' : 'error'} text={text ? '通过' : '未通过'}/>
    },
  ]

  const getSource = () => {
    if (response.asserts === undefined || !response.asserts) {
      return [];
    }
    const temp = JSON.parse(response.asserts)
    const result = [];
    Object.keys(temp).forEach(k => {
      if (typeof temp[k].msg === "string") {
        result.push({
          status: temp[k].status,
          msg: temp[k].msg,
        })
      } else {
        temp[k].msg.forEach(v => {
          result.push({
            status: temp[k].status,
            msg: v,
          })
        })
      }
    })
    return result;
  }

  return (
    <Drawer title={<span>[<strong>{caseName}</strong>] 执行详情</span>} width={width || 1000}
            visible={modal} placement="right"
            onClose={() => setModal(false)}>
      <Row gutter={[8, 8]}>
        <Tabs style={{width: '100%'}} tabPosition="left">
          <TabPane tab={<span><IconFont type="icon-yongliliebiao"/>基本信息</span>} key="1">
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="测试结果">
                <Badge status={response.status ? "success" : "error"} text={response.status ? "成功" : "失败"}/>
              </Descriptions.Item>
              <Descriptions.Item label="请求方式">
                {response.request_method}
              </Descriptions.Item>
              <Descriptions.Item label="HTTP状态码">
                  <span
                    style={{
                      color: STATUS[response.status_code] ? STATUS[response.status_code].color : '#F56C6C',
                      marginLeft: 8,
                      marginRight: 8,
                    }}
                  >
                    {response.status_code}{' '}
                    {STATUS[response.status_code] ? STATUS[response.status_code].text : ''}
                  </span>
              </Descriptions.Item>
              <Descriptions.Item label="执行时间">
                  <span style={{marginLeft: 8, marginRight: 8}}>
                    <span style={{color: '#67C23A'}}>{response.cost}</span>
                  </span>
              </Descriptions.Item>
              <Descriptions.Item label="请求url" span={2}>
                {response.url}
              </Descriptions.Item>
              <Descriptions.Item label="请求body" span={2}>
                {
                  response.request_data ? <SyntaxHighlighter language='json' style={vs2015}>
                    {response.request_data}
                  </SyntaxHighlighter> : <NoRecord height={120}/>
                }
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-duanyan"/>断言</span>} key="3">
            <Table
              columns={assertTable}
              dataSource={getSource()}
              size="small"
              pagination={false}
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-rizhi"/>执行日志</span>} key="2">
            <CodeEditor
              language="text"
              value={response.logs}
              height="80vh"
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-header"/>Request Headers</span>} key="5">
            <Table
              columns={resColumns}
              dataSource={toTable('request_headers')}
              size="small"
              pagination={false}
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-cookies-1"/>Cookie</span>} key="6">
            <Table
              columns={resColumns}
              dataSource={toTable('cookies')}
              size="small"
              pagination={false}
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-header"/>Response Headers</span>} key="7">
            <Table
              columns={resColumns}
              dataSource={toTable('response_headers')}
              size="small"
              pagination={false}
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-xiangying"/>Response</span>} key="4">
            <CodeEditor
              value={response.response ? response.response : ''}
              height="45vh"
            />
          </TabPane>
          <TabPane tab={<span><IconFont type="icon-tounaofengbao"/>脑图</span>} key="8">
            <div id="container">
              <TreeXmind data={xmindData} graph={graph} setGraph={setGraph}/>
            </div>
          </TabPane>
        </Tabs>
      </Row>
    </Drawer>
  )
}
