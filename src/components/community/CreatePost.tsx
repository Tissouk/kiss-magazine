'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  PhotoIcon,
  XMarkIcon,
  TagIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pointValues = {
    post: 25,
    withPhoto: 50,
    withMultiplePhotos: 75,
    firstPost: 100
  };

  const suggestedTags = [
    'korean-fashion', 'k-beauty', 'seoul-style', 'hongdae', 'gangnam',
    'k-pop', 'k-drama', 'haul', 'ootd', 'skincare-routine', 'makeup',
    'street-style', 'vintage', 'oversized', 'minimalist'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 10) {
      setTags(prev => [...prev, cleanTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const calculatePoints = () => {
    let points = pointValues.post;
    if (images.length === 1) points = pointValues.withPhoto;
    if (images.length > 1) points = pointValues.withMultiplePhotos;
    return points;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          // Simulate image upload - replace with real upload logic
          return URL.createObjectURL(image);
        })
      );

      const newPost = {
        id: Date.now().toString(),
        content: content.trim(),
        images: imageUrls,
        tags,
        location,
        pointsEarned: calculatePoints(),
        createdAt: new Date(),
        likes: 0,
        comments: []
      };

      onPostCreated?.(newPost);
      
      // Reset form
      setContent('');
      setImages([]);
      setTags([]);
      setLocation('');
      
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-korean-400 to-kpop-pink flex items-center justify-center text-white font-semibold">
          U
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Share with the Community</h3>
          <p className="text-sm text-gray-500">
            Earn <span className="font-medium text-korean-500">+{calculatePoints()} points</span> for this post
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your Korean style, beauty routine, or cultural experience..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-korean-500 focus:border-transparent"
            rows={4}
            maxLength={500}
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/500
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Add Photos (up to 5)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-korean-100 text-korean-700 px-3 py-1 rounded-lg text-sm hover:bg-korean-200 transition-colors"
            >
              <PhotoIcon className="h-4 w-4 inline mr-1" />
              Add Photo
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Add Tags
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-korean-100 text-korean-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-korean-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              type="button"
              onClick={() => tagInput.trim() && addTag(tagInput.trim())}
              className="bg-korean-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-korean-600 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedTags.filter(tag => !tags.includes(tag)).slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-korean-100 hover:text-korean-600 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Location (Optional)
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Seoul, Hongdae..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-korean-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Points Preview */}
        <div className="bg-korean-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-korean-500" />
            <span className="font-medium text-korean-700">You'll earn points for:</span>
          </div>
          <ul className="text-sm text-korean-600 space-y-1">
            <li>• Creating a post: +{pointValues.post} points</li>
            {images.length === 1 && <li>• Adding a photo: +{pointValues.withPhoto - pointValues.post} points</li>}
            {images.length > 1 && <li>• Adding multiple photos: +{pointValues.withMultiplePhotos - pointValues.post} points</li>}
            <li className="font-medium">Total: +{calculatePoints()} points</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-full bg-korean-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-korean-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Share Post'}
        </button>
      </form>
    </div>
  );
}