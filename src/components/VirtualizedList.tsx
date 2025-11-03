import React, { memo, useMemo } from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';

interface VirtualizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  itemHeight?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  initialNumToRender?: number;
  updateCellsBatchingPeriod?: number;
  getItemLayout?: (data: T[] | null | undefined, index: number) => { length: number; offset: number; index: number };
}

const VirtualizedList = <T,>({
  data,
  renderItem,
  itemHeight = 100,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  removeClippedSubviews = true,
  initialNumToRender = 10,
  updateCellsBatchingPeriod = 50,
  getItemLayout,
  ...props
}: VirtualizedListProps<T>) => {
  const optimizedGetItemLayout = useMemo(() => {
    if (getItemLayout) return getItemLayout;
    
    return (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [getItemLayout, itemHeight]);

  const optimizedProps = useMemo(() => ({
    ...props,
    data,
    renderItem,
    maxToRenderPerBatch,
    windowSize,
    removeClippedSubviews,
    initialNumToRender,
    updateCellsBatchingPeriod,
    getItemLayout: optimizedGetItemLayout,
    keyExtractor: props.keyExtractor || ((item: any, index: number) => 
      item?.id?.toString() || index.toString()
    ),
  }), [
    data,
    renderItem,
    maxToRenderPerBatch,
    windowSize,
    removeClippedSubviews,
    initialNumToRender,
    updateCellsBatchingPeriod,
    optimizedGetItemLayout,
    props
  ]);

  return <FlatList {...optimizedProps} />;
};

export default memo(VirtualizedList) as <T>(props: VirtualizedListProps<T>) => JSX.Element;
