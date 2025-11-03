import React, { useState, useCallback, memo } from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet } from 'react-native';
import { getOptimizedImageUrl } from '../utils/performance';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  placeholder?: string;
  showLoading?: boolean;
  fallbackColor?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  uri,
  width,
  height,
  placeholder,
  showLoading = true,
  fallbackColor = '#f0f0f0',
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const optimizedUri = getOptimizedImageUrl(uri, width, height);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  if (error && placeholder) {
    return (
      <Image
        source={{ uri: placeholder }}
        style={[style, { width, height }]}
        {...props}
      />
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.fallback,
          { width, height, backgroundColor: fallbackColor },
          style
        ]}
      />
    );
  }

  return (
    <View style={[{ width, height }, style]}>
      <Image
        source={{ uri: optimizedUri }}
        style={[styles.image, { width, height }]}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {loading && showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
