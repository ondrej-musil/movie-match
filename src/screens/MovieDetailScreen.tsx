import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';
import * as Haptics from 'expo-haptics';
import { fetchWatchProviders } from '../api/tmdb';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { movie } = route.params as { movie: Movie };

  const [providers, setProviders] = useState<any>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [errorProviders, setErrorProviders] = useState<string | null>(null);

  useEffect(() => {
    setLoadingProviders(true);
    fetchWatchProviders(movie.id)
      .then((data) => {
        setProviders(data);
        setLoadingProviders(false);
      })
      .catch((err) => {
        setErrorProviders('Could not load watch providers');
        setLoadingProviders(false);
      });
  }, [movie.id]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={handleClose}
          className="bg-gray-800 rounded-full p-3"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-semibold">Movie Details</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Movie Poster */}
        <View className="items-center px-6 mb-6">
          <Image
            source={{ uri: movie.poster }}
            style={{ width: width * 0.6, height: width * 0.9 }}
            contentFit="cover"
            contentPosition="top"
            className="rounded-2xl"
          />
        </View>

        {/* Movie Info */}
        <View className="px-6">
          {/* Title and Rating */}
          <View className="mb-4">
            <Text className="text-white text-3xl font-bold mb-2">
              {movie.title}
            </Text>
            <View className="flex-row items-center mb-1">
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 text-lg font-semibold ml-2">
                {movie.rating}
              </Text>
            </View>
            <Text className="text-gray-400 text-lg">
              {movie.year} • {movie.duration === 0 ? 'I couldn’t find how long the movie is.' : `${movie.duration}min`}
            </Text>
          </View>

          {/* Genres */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Genres</Text>
            <View className="flex-row flex-wrap">
              {movie.genre.map((genre, index) => (
                <View 
                  key={index} 
                  className="bg-gray-700 rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-gray-300 text-sm">{genre}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Director */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-2">Director</Text>
            <Text className="text-gray-300 text-base">{movie.director}</Text>
          </View>

          {/* Cast */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-2">Cast</Text>
            <View className="flex-row flex-wrap">
              {movie.cast.map((actor, index) => (
                <View key={index} className="mr-4 mb-2">
                  <Text className="text-gray-300 text-base">{actor}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Watch Providers */}
          <View className="mb-8">
            {loadingProviders && (
              <Text className="text-gray-400">Loading providers...</Text>
            )}
            {errorProviders && (
              <Text className="text-red-400">{errorProviders}</Text>
            )}
            {providers && (
              <>
                {providers.flatrate && providers.flatrate.length > 0 && (
                  <View className="mb-2">
                    <Text className="text-white text-lg font-semibold mb-1">Streaming</Text>
                    <View className="flex-row flex-wrap items-center">
                      {providers.flatrate.map((prov: any) => (
                        <View
                          key={prov.provider_id}
                          className="bg-blue-700 rounded-full px-3 py-1 mr-2 mb-2"
                          style={{ minHeight: 28, justifyContent: 'center' }}
                        >
                          <Text className="text-xs text-white" style={{ lineHeight: 18 }}>{prov.provider_name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {/* Rent and Buy combined if identical */}
                {providers.rent && providers.buy &&
                  providers.rent.length > 0 &&
                  providers.buy.length > 0 &&
                  providers.rent.length === providers.buy.length &&
                  providers.rent.every((r: any, i: number) => r.provider_id === providers.buy[i].provider_id) ? (
                  <View className="mb-2">
                    <Text className="text-white text-lg font-semibold mb-1">Rent and Buy services:</Text>
                    <View className="flex-row flex-wrap items-center">
                      {providers.rent
                        .filter((prov: any, idx: number, arr: any[]) => arr.findIndex(p => p.provider_id === prov.provider_id) === idx)
                        .map((prov: any) => (
                          <View
                            key={prov.provider_id}
                            className="bg-yellow-700 rounded-full px-3 py-1 mr-2 mb-2"
                            style={{ minHeight: 28, justifyContent: 'center' }}
                          >
                            <Text className="text-xs text-white" style={{ lineHeight: 18 }}>{prov.provider_name}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                ) : <>
                  {providers.rent && providers.rent.length > 0 && (
                    <View className="mb-2">
                      <Text className="text-white text-lg font-semibold mb-1">Rent</Text>
                      <View className="flex-row flex-wrap items-center">
                        {providers.rent.map((prov: any) => (
                          <View
                            key={prov.provider_id}
                            className="bg-yellow-700 rounded-full px-3 py-1 mr-2 mb-2"
                            style={{ minHeight: 28, justifyContent: 'center' }}
                          >
                            <Text className="text-xs text-white" style={{ lineHeight: 18 }}>{prov.provider_name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {providers.buy && providers.buy.length > 0 && (
                    <View className="mb-2">
                      <Text className="text-white text-lg font-semibold mb-1">Buy</Text>
                      <View className="flex-row flex-wrap items-center">
                        {providers.buy.map((prov: any) => (
                          <View
                            key={prov.provider_id}
                            className="bg-green-700 rounded-full px-3 py-1 mr-2 mb-2"
                            style={{ minHeight: 28, justifyContent: 'center' }}
                          >
                            <Text className="text-xs text-white" style={{ lineHeight: 18 }}>{prov.provider_name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>}
                {!providers.flatrate && !providers.rent && !providers.buy && (
                  <Text className="text-gray-400">I couldn’t find where to watch this movie.</Text>
                )}
              </>
            )}
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-2">Description</Text>
            <Text className="text-gray-300 text-base">{movie.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View className="px-6 py-4 bg-gray-800 bg-opacity-50">
        <Text className="text-gray-400 text-center text-sm">
          Close this screen to continue swiping
        </Text>
      </View>
    </SafeAreaView>
  );
}