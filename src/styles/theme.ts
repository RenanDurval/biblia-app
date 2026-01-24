
// Theme Definition with Premium Colors
export const createTheme = (isDark: boolean) => {
    const palette = {
        // Primary Colors (Gold/Royal Blue)
        primary: isDark ? '#FFD700' : '#B8860B', // Gold
        primaryLight: isDark ? '#FFE44D' : '#DAA520',
        primaryDark: isDark ? '#B29700' : '#8B6914',

        // Secondary Colors (Royal Blue/Navy)
        secondary: isDark ? '#4169E1' : '#003366',
        secondaryLight: isDark ? '#6495ED' : '#004C99',

        // Backgrounds
        background: isDark ? '#121212' : '#FDFBF7', // Cream background for light mode (paper-like)
        surface: isDark ? '#1E1E1E' : '#FFFFFF',
        surfaceVariant: isDark ? '#2C2C2C' : '#F5F5F5',

        // Text
        text: isDark ? '#FFFFFF' : '#2D2D2D',
        textSecondary: isDark ? '#A0A0A0' : '#5D5D5D',

        // Status
        error: '#CF6679',
        success: '#4BB543',
    };

    return {
        colors: palette,
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
        borderRadius: {
            sm: 8,
            md: 12,
            lg: 16,
            xl: 24,
        },
        typography: {
            h1: { fontSize: 32, fontWeight: '700' },
            h2: { fontSize: 24, fontWeight: '600' },
            h3: { fontSize: 20, fontWeight: '600' },
            body: { fontSize: 16, lineHeight: 24 },
            caption: { fontSize: 14, color: palette.textSecondary },
        },
        shadows: isDark ? {
            // Subtle glow for dark mode
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
            }
        } : {
            // Soft shadows for light mode
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
            }
        }
    };
};
