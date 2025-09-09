import React from "react";

/**
 * EditableRow
 * @param {props} param
 * @returns {Component}
 */
const EditableRow = (props) => {
  const nwProps = { ...props };
  const { editing } = nwProps;
  if (editing) {
    nwProps.className = `${nwProps.className} editing-row`;
  }
  return <tr {...nwProps} />;
};

export default EditableRow;