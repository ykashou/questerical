import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';

interface AIAssistantProps {
  onClose: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  questType: string;
}

export default function AIAssistant({ onClose, onSelectSuggestion, questType }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { colors } = useThemeStore();

  const generateSuggestions = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a creative quest designer for a personal quest tracking app. Generate 3 different quest ideas based on the user's prompt. Each quest should be concise (max 100 characters) and engaging. Focus on ${questType} quests.`
        },
        {
          role: 'user',
          content: prompt
        }
      ];
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }
      
      const data = await response.json();
      
      // Parse the response to extract the suggestions
      const text = data.completion;
      const extractedSuggestions = text
        .split(/\d+\./)
        .map((suggestion: string) => suggestion.trim())
        .filter(Boolean);
      
      setSuggestions(extractedSuggestions);
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Sparkles size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>AI Quest Assistant</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Describe what kind of quest you want to create, and our AI will suggest some ideas.
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="E.g., fitness goals, learning a new language..."
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.generateButton,
            { backgroundColor: colors.primary },
            (!prompt.trim() || loading) && styles.disabledButton
          ]} 
          onPress={generateSuggestions}
          disabled={!prompt.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Sparkles size={16} color={colors.text} />
              <Text style={[styles.generateButtonText, { color: colors.text }]}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}
      
      {suggestions.length > 0 && (
        <>
          <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Suggestions</Text>
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionItem, { backgroundColor: colors.background }]}
                onPress={() => onSelectSuggestion(suggestion)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  generateButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsContainer: {
    maxHeight: 200,
  },
  suggestionItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
  },
});