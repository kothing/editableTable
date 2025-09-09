/* eslint-disable react/jsx-boolean-value */
/* eslint-disable no-nested-ternary */
import React, {
  useState,
  useEffect,
  useRef,
  memo,
  forwardRef,
  useImperativeHandle,
  Fragment,
} from "react";
import { Button, Form, Typography, Table, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getGUID } from "./helper";
import EditableCell from "./EditableCell";
import EditableRow from "./EditableRow";
import "./index.less";

// 初始化TableData
const initTableData = (listData = []) => {
  return Array.isArray(listData)
    ? listData.map((item) => ({ ...item, uniqKey: item.uniqKey || getGUID() }))
    : [];
};

/**
 * ==============================================
 * EditableTable 可编辑Table
 * @returns {React.Component}
 * ==============================================
 */
const EditableTable = forwardRef(
  (
    {
      value,
      columns,
      renderEditableCell,
      editable = true,
      formInitialValues = {},
      onChange = () => {},
      onRowNew = () => {},
      onRowEdit = () => {},
      onRowOkBefore = () => {},
      onRowOk = () => {},
      onRowCancel = () => {},
      onRowRemove = () => {},
      className = "",
    },
    ref
  ) => {
    const [wrapForm] = Form.useForm();
    const initDataList = initTableData(value);
    const [dataSource, setDataSource] = useState(initDataList);

    const dataSourceRef = useRef(initDataList);
    const editingRef = useRef(false); // table是否在「编辑中」
    const editingKeyRef = useRef(null); // 当前编辑行中的key

    useEffect(() => {
      if (value) {
        const initData = initTableData(value);
        setDataSource(initData);
        dataSourceRef.current = initData;
      }
      // editingRef.current = false;
      // editingKeyRef.current = null;
    }, [value]);

    useEffect(() => {
      if (editable === false && editingRef.current) {
        const rowData = dataSource.find(
          (item) => item.uniqKey === editingKeyRef.current
        );
        handleCancelEditRow(rowData);
      }
    }, [editable]);

    /**
     * 暴露组件的方法
     */
    useImperativeHandle(ref, () => ({
      // 获取table数据
      getValues: () => dataSourceRef.current,
      // 设置table数据
      setValues: (data) => {
        if (Array.isArray(data)) {
          const targetData = initTableData(data);
          setDataSource(targetData);
          dataSourceRef.current = targetData;
        }
      },
      // 获取Table是否编辑中
      getTableIsEditing: () => editingRef.current,
      // 获取Table当前编辑行中的key
      getTableEditingKey: () => editingKeyRef.current,
      // 取消编辑
      cancelEditingRow: handleCancelEditRow,
    }));

    /**
     * 添加行
     */
    const handleNewRow = () => {
      if (editingKeyRef.current !== null) {
        message.warn("请先保存编辑行~");
      } else {
        wrapForm.resetFields();
        const uniqKey = getGUID();
        editingRef.current = true;
        editingKeyRef.current = uniqKey;
        const newData = {
          uniqKey,
          editing: true,
          isNewRow: true, // 新增行
        };
        wrapForm.setFieldsValue(formInitialValues);
        const nwData = [...dataSource, newData];
        setDataSource(nwData);
        dataSourceRef.current = nwData;
        onChange(nwData);
        if (typeof onRowNew === "function") {
          onRowNew();
        }
      }
    };

    /**
     * 编辑
     */
    const handleEditRow = (rowData) => {
      editingRef.current = true;
      editingKeyRef.current = rowData.uniqKey || getGUID();
      wrapForm.resetFields();
      const nwData = dataSource.map((item) => {
        const nwItem = { ...item };
        if (item.uniqKey === rowData.uniqKey) {
          nwItem.editing = true;
        }
        delete nwItem.isNewRow;
        return nwItem;
      });
      setDataSource(nwData);
      dataSourceRef.current = nwData;
      onChange(nwData);
      wrapForm.setFieldsValue({ ...rowData });
      if (typeof onRowEdit === "function") {
        onRowEdit(rowData, wrapForm);
      }
    };

    /**
     * 保存
     */
    const handleSaveRow = async (rowData) => {
      try {
        editingRef.current = false;
        editingKeyRef.current = null;
        // 获取【当前行】即【表单】的数据
        let editedRowData = await wrapForm.validateFields();
        const newData = dataSource.map((item) => {
          const nwItem = { ...item };
          delete nwItem.isNewRow;
          delete nwItem.editing;
          return nwItem;
        });
        const index = newData.findIndex(
          (item) => rowData.uniqKey === item.uniqKey
        );
        if (index > -1) {
          // 如果保存的是已存在的row
          let curRow = newData[index];
          if (typeof onRowOkBefore === "function") {
            // ok确定前的回调函数，返回处理后的rowData
            const newSortData = onRowOkBefore(editedRowData, newData[index]);
            if (
              Object.prototype.toString.call(newSortData) === "[object Object]"
            ) {
              editedRowData = newSortData;
              curRow = newSortData;
            }
          }
          // 合并当前行数据和新数据
          const mergedRowData = { ...curRow, ...editedRowData };
          newData.splice(index, 1, mergedRowData);
          setDataSource(newData);
          dataSourceRef.current = newData;
          if (typeof onChange === "function") {
            onChange(mergedRowData);
          }
          if (typeof onRowOk === "function") {
            onRowOk(curRow, newData);
          }
        } else {
          // 如果保存的是新增的row
          if (typeof onRowOkBefore === "function") {
            // ok确定前的回调函数，返回处理后的rowData
            const newSortData = onRowOkBefore(editedRowData);
            if (
              Object.prototype.toString.call(newSortData) === "[object Object]"
            ) {
              editedRowData = newSortData;
            }
          }
          newData.push(editedRowData);
          setDataSource(newData);
          dataSourceRef.current = newData;
          if (typeof onChange === "function") {
            onChange(newData);
          }
          if (typeof onRowOk === "function") {
            onRowOk(editedRowData);
          }
        }
        wrapForm.resetFields();
      } catch (errInfo) {
        console.warn("Validate Failed:", errInfo);
      }
    };

    /**
     * 取消编辑
     */
    const handleCancelEditRow = (rowData) => {
      const editingRow =
        rowData ||
        (dataSourceRef.current || []).find(
          (item) => item.uniqKey === editingKeyRef.current
        );
      let fmData = (dataSourceRef.current || []).map((item) => {
        const nwItem = { ...item };
        delete nwItem.editing;
        return nwItem;
      });
      // 如果是新增行的「取消」，则删除新增行
      if (editingRow && editingRow?.isNewRow) {
        fmData = fmData.filter((item) => item.uniqKey !== editingRow.uniqKey);
      }
      editingRef.current = false;
      editingKeyRef.current = null;
      setDataSource(fmData);
      dataSourceRef.current = fmData;
      if (typeof onChange === "function") {
        onChange(fmData);
      }
      if (typeof onRowCancel === "function") {
        onRowCancel(fmData);
      }
    };

    /**
     * 删除
     */
    const handleRemoveRow = (rowData) => {
      const newData = dataSource.filter(
        (item) => item.uniqKey !== rowData.uniqKey
      );
      setDataSource(newData);
      dataSourceRef.current = newData;
      if (typeof onChange === "function") {
        onChange(newData);
      }
      if (typeof onRowRemove === "function") {
        onRowRemove(rowData, newData);
      }
    };

    /**
     * 渲染Colums
     */
    const defaultColumns = [
      {
        title: "名称",
        dataIndex: "name",
        width: "45%",
        editable: true,
      },
      {
        title: "值",
        dataIndex: "value",
        width: "45%",
        editable: true,
      },
    ];

    const renderColumns = () => {
      const fieldColumns = columns || defaultColumns;
      return (
        editable
          ? [
              ...fieldColumns,
              {
                title: "操作",
                dataIndex: "action_col",
                width: 160,
                render: (_, rowData) => {
                  const rowEditable = rowData.uniqKey === editingKeyRef.current;
                  return (
                    <span className="table-row-action">
                      {rowEditable ? (
                        <Fragment>
                          {/* 保存 */}
                          <Typography.Link
                            onClick={() => handleSaveRow(rowData)}
                            className="ok-btn"
                          >
                            <CheckOutlined /> 确定
                          </Typography.Link>
                          {/* 取消 */}
                          <Typography.Link
                            onClick={() => handleCancelEditRow(rowData)}
                            className="cancel-btn"
                          >
                            <CloseOutlined /> 取消
                          </Typography.Link>
                        </Fragment>
                      ) : (
                        <Fragment>
                          {/* 编辑 */}
                          <Typography.Link
                            disabled={editingKeyRef.current !== null}
                            onClick={
                              editingKeyRef.current == null
                                ? () => handleEditRow(rowData)
                                : () => {}
                            }
                            className="edit-btn"
                          >
                            <FormOutlined /> 编辑
                          </Typography.Link>
                          {/* 删除 */}
                          {editingKeyRef.current !== null ? (
                            <Typography.Link disabled={true}>
                              <DeleteOutlined /> 移除
                            </Typography.Link>
                          ) : (
                            <Popconfirm
                              title="确定移除?"
                              onConfirm={() => handleRemoveRow(rowData)}
                            >
                              <Typography.Link>
                                <DeleteOutlined /> 移除
                              </Typography.Link>
                            </Popconfirm>
                          )}
                        </Fragment>
                      )}
                    </span>
                  );
                },
              },
            ]
          : fieldColumns
      ).map((col) => {
        if (col.editable) {
          return {
            ...col,
            onCell: (rowData) => ({
              wrapForm,
              rowData,
              dataIndex: col.dataIndex,
              title: col.title,
              isRequired: true,
              editing: rowData.uniqKey === editingKeyRef.current,
            }),
          };
        }
        return col;
      });
    };

    return (
      <Form
        form={wrapForm}
        name="editableTableForm"
        initialValues={formInitialValues || {}}
        className={`editable-table-form${className ? ` ${className}` : ""}`}
      >
        <Table
          components={{
            body: {
              row: EditableRow,
              cell: renderEditableCell || EditableCell,
            },
          }}
          onRow={(rowData) => ({
            editing: !!rowData.editing,
          })}
          dataSource={dataSource}
          columns={renderColumns()}
          pagination={false}
          className="editable-table"
          rowKey="uniqKey"
          rowClassName="editable-row"
          locale={{
            emptyText: "暂无数据",
          }}
        />
        {editable ? (
          <div className="new-item-btn">
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={handleNewRow}
            >
              新增
            </Button>
          </div>
        ) : null}
      </Form>
    );
  }
);

export default memo(EditableTable);
