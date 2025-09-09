import React from "react";
import { Input, Select, Form } from "antd";

/**
 * EditableCell
 * @param {props} param
 * @returns {React.Component}
 */
const EditableCell = ({
  wrapForm,
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
      case "name": {
        return <Input placeholder="请输入" />;
      }
      case "value": {
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

  const newRestProps = { ...restProps };
  if (newRestProps.wrapForm) {
    delete newRestProps.wrapForm;
  }
  
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

export default EditableCell;