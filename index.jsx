/* eslint-disable no-nested-ternary */
import React, { useState, useRef } from "react";
import { Input, Select, Form } from "antd";
import EditableTable from "./EditableTable";
import "./index.less";

/**
 * ==============================================
 * App 可编辑Table
 * @returns {React.Component}
 * ==============================================
 */
const App = (props, ref) => {
  const [tableData, setTableData] = useState([]);
  const tableRef = useRef();

  const updateState = () => {
    setTimeout(() => {
      setTableData([
        {
          serviceName: "ServiceName1",
          namelistName: "NamelistName1",
        },
      ]);
    }, 300);
  };

  // 表格列配置
  const columns = [
    {
      title: "服务名",
      dataIndex: "serviceName",
      width: "45%",
      editable: true,
    },
    {
      title: "名单名",
      dataIndex: "namelistName",
      width: "45%",
      editable: true,
    },
  ];

  // 可编辑单元格
  const renderEditableCell = ({
    rowData,
    dataIndex,
    title,
    isRequired,
    editing,
    children,
    ...restProps
  }) => {
    // 渲染编辑模式时的Node
    const renderInputNode = () => {
      switch (dataIndex) {
        case "serviceName": {
          return (
            <Select mode="multiple" placeholder="请选择">
              <Select.Option value="value1">选项1</Select.Option>
            </Select>
          );
        }
        case "namelistName": {
          return (
            <Select mode="multiple" placeholder="请选择">
              <Select.Option value="value1">选项1</Select.Option>
            </Select>
          );
        }
        default: {
          return <Input placeholder="请输入" />;
        }
      }
    };
    // 渲染只读模式时的Node
    const renderChildNode = () => {
      switch (dataIndex) {
        case "other": {
          return rowData[dataIndex];
        }
        default: {
          return children;
        }
      }
    };
    return (
      <td
        {...restProps}
        className={`${restProps.className || ""} editable-cell${
          dataIndex ? ` ${dataIndex}-cell` : ""
        }`}
      >
        {editing ? (
          <Form.Item
            name={dataIndex}
            className={`table-cell-form-item ${dataIndex}-field`}
          >
            {renderInputNode()}
          </Form.Item>
        ) : (
          renderChildNode()
        )}
      </td>
    );
  };

  return (
    <>
      <EditableTable
        tableData={tableData}
        columns={columns}
        renderEditableCell={renderEditableCell}
        ref={tableRef}
        onChange={() => {}}
      />
      <br />
      <button onClick={updateState}>更新state</button>
    </>
  );
};

export default App;
