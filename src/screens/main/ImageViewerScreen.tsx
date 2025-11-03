import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ImageViewerScreenProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageViewerScreen = ({ visible, images, initialIndex = 0, onClose }: ImageViewerScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Gesture değerleri
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Resim değiştiğinde değerleri sıfırla
  React.useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [currentIndex]);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Scale sınırları (1x - 4x)
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      }
    })
    .runOnJS(true);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      // Pan sınırları - zoom seviyesine göre
      const maxTranslateX = (width * (scale.value - 1)) / 2;
      const maxTranslateY = (height * (scale.value - 1)) / 2;
      
      if (translateX.value > maxTranslateX) {
        translateX.value = withSpring(maxTranslateX);
      } else if (translateX.value < -maxTranslateX) {
        translateX.value = withSpring(-maxTranslateX);
      }
      
      if (translateY.value > maxTranslateY) {
        translateY.value = withSpring(maxTranslateY);
      } else if (translateY.value < -maxTranslateY) {
        translateY.value = withSpring(-maxTranslateY);
      }
      
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .runOnJS(true);

  // Gesture'ları birleştir - Simultaneous yerine Race kullan
  const composedGesture = Gesture.Race(pinchGesture, panGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const previousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {currentIndex + 1} / {images.length}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image Container */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image
              source={{ uri: images[currentIndex] }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={previousImage}
              >
                <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {currentIndex < images.length - 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={nextImage}
              >
                <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => {
              const newScale = Math.min(savedScale.value * 1.5, 4);
              scale.value = withSpring(newScale);
              savedScale.value = newScale;
              
              // Pan sınırlarını güncelle
              const maxTranslateX = (width * (newScale - 1)) / 2;
              const maxTranslateY = (height * (newScale - 1)) / 2;
              
              if (translateX.value > maxTranslateX) {
                translateX.value = withSpring(maxTranslateX);
                savedTranslateX.value = maxTranslateX;
              } else if (translateX.value < -maxTranslateX) {
                translateX.value = withSpring(-maxTranslateX);
                savedTranslateX.value = -maxTranslateX;
              }
              
              if (translateY.value > maxTranslateY) {
                translateY.value = withSpring(maxTranslateY);
                savedTranslateY.value = maxTranslateY;
              } else if (translateY.value < -maxTranslateY) {
                translateY.value = withSpring(-maxTranslateY);
                savedTranslateY.value = -maxTranslateY;
              }
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => {
              const newScale = Math.max(savedScale.value / 1.5, 1);
              scale.value = withSpring(newScale);
              savedScale.value = newScale;
              
              // Pan sınırlarını güncelle
              const maxTranslateX = (width * (newScale - 1)) / 2;
              const maxTranslateY = (height * (newScale - 1)) / 2;
              
              if (translateX.value > maxTranslateX) {
                translateX.value = withSpring(maxTranslateX);
                savedTranslateX.value = maxTranslateX;
              } else if (translateX.value < -maxTranslateX) {
                translateX.value = withSpring(-maxTranslateX);
                savedTranslateX.value = -maxTranslateX;
              }
              
              if (translateY.value > maxTranslateY) {
                translateY.value = withSpring(maxTranslateY);
                savedTranslateY.value = maxTranslateY;
              } else if (translateY.value < -maxTranslateY) {
                translateY.value = withSpring(-maxTranslateY);
                savedTranslateY.value = -maxTranslateY;
              }
            }}
          >
            <Ionicons name="remove" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10000,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  image: {
    width: width,
    height: height,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -48 }],
    flexDirection: 'row',
    gap: 12,
    zIndex: 10000,
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
  },
});

export default ImageViewerScreen;
