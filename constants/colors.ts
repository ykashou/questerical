// Nord theme colors
export const nordDark = {
  background: '#2E3440',
  card: '#3B4252',
  text: '#ECEFF4',
  textSecondary: '#D8DEE9',
  primary: '#88C0D0',
  secondary: '#81A1C1',
  accent: '#5E81AC',
  success: '#8FBCBB',
  danger: '#BF616A',
  warning: '#EBCB8B',
  border: '#434C5E',
  overlay: 'rgba(26, 27, 38, 0.8)',
  
  questTypes: {
    main: '#B48EAD',    // Purple for main quests
    side: '#88C0D0',    // Blue for side quests
    mini: '#A3BE8C',    // Green for mini quests
  },
  
  privacyTypes: {
    private: '#4C566A',  // Dark for private
    shared: '#81A1C1',   // Blue for shared
    public: '#5E81AC',   // Darker blue for public
  }
};

export const nordLight = {
  background: '#FEFEFE',
  card: '#FFFFFF',
  text: '#2E3440',
  textSecondary: '#4C566A',
  primary: '#5E81AC',
  secondary: '#81A1C1',
  accent: '#88C0D0',
  success: '#A3BE8C',
  danger: '#BF616A',
  warning: '#EBCB8B',
  border: '#E5E9F0',
  overlay: 'rgba(236, 239, 244, 0.8)',
  
  questTypes: {
    main: '#B48EAD',    // Purple for main quests
    side: '#5E81AC',    // Blue for side quests
    mini: '#A3BE8C',    // Green for mini quests
  },
  
  privacyTypes: {
    private: '#4C566A',  // Dark for private
    shared: '#81A1C1',   // Blue for shared
    public: '#5E81AC',   // Darker blue for public
  }
};

// Export colors based on the current theme
export const colors = nordDark;