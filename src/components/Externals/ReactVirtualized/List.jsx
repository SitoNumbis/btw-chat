import PropTypes from "prop-types";

import List from "react-virtualized/dist/commonjs/List";

function MyList(props) {
  const { items } = props;

  const rowRenderer = ({ index, key, style }) => {
    const item = items[index];

    return (
      <div key={key} style={style}>
        {item}
      </div>
    );
  };

  return (
    <List
      width={300}
      height={400}
      rowCount={items.length}
      rowHeight={50}
      rowRenderer={rowRenderer}
    />
  );
}

MyList.propTypes = {
  items: PropTypes.array,
};

export default MyList;
