import os

def update_budget():
    path = 'src/components/profile/BudgetSettingsCard.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Replace header declaration
    old_decl = """  const { tokens, isDark, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;"""

    new_decl = """  const { tokens, isDark, mode } = useTheme();
  const isPink = mode === 'pink';
  const isHeocon = true; // Cả Heo Con và Pastel Pink đều chuẩn Neo-Brutalist Pixel Art 100%
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const cardBorder = isPink ? '#3B0713' : '#2B2118';
  const inkText = isPink ? '#3B0713' : '#2B2118';
  const inkMuted = isPink ? '#834758' : '#6E5D4F';
  const pageBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const chipBg = isPink ? '#FCE7F3' : '#FFF4CC';"""

    if old_decl in text:
        text = text.replace(old_decl, new_decl)
        print('Header declaration replaced successfully')
    else:
        print('Header declaration NOT found')

    # Replace font guards
    text = text.replace("isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' }", "{ fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' }")
    text = text.replace("isHeocon && { fontFamily: 'Baloo2_800ExtraBold' }", "{ fontFamily: 'Baloo2_800ExtraBold' }")
    text = text.replace("isHeocon && { fontFamily: 'Nunito', fontWeight: '700' }", "{ fontFamily: 'Nunito', fontWeight: '700' }")
    text = text.replace("isHeocon && { fontFamily: 'Nunito', fontWeight: '800' }", "{ fontFamily: 'Nunito', fontWeight: '800' }")
    text = text.replace("isHeocon && { fontFamily: 'Nunito', fontWeight: '600' }", "{ fontFamily: 'Nunito', fontWeight: '600' }")

    # Replace hardcoded theme colors inside JSX
    text = text.replace("backgroundColor: '#FFFBF1'", "backgroundColor: cardBg")
    text = text.replace("backgroundColor: '#F6EEDC'", "backgroundColor: pageBg")
    text = text.replace("borderColor: '#2B2118'", "borderColor: cardBorder")
    text = text.replace("shadowColor: '#2B2118'", "shadowColor: cardBorder")
    text = text.replace("borderTopColor: '#2B2118'", "borderTopColor: cardBorder")
    text = text.replace("borderBottomColor: '#2B2118'", "borderBottomColor: cardBorder")
    text = text.replace("color: isHeocon ? '#2B2118' : (isDark ? '#FAF6EC' : '#1B2733')", "color: inkText")
    text = text.replace("color: isHeocon ? '#2B2118' : (isDark ? '#FFFFFF' : '#1B2733')", "color: inkText")
    text = text.replace("color: isHeocon ? '#2B2118' : tokens.primary", "color: inkText")
    text = text.replace("color: isHeocon ? '#6E5D4F' : tokens.textMuted", "color: inkMuted")
    text = text.replace("<SlidersHorizontal size={19} color={isHeocon ? '#2B2118' : tokens.primary}", "<SlidersHorizontal size={19} color={inkText}")
    text = text.replace("<Coins size={18} color={isHeocon ? '#2B2118' : tokens.primary}", "<Coins size={18} color={inkText}")
    text = text.replace("<Receipt size={18} color={isHeocon ? '#2B2118' : tokens.primary}", "<Receipt size={18} color={inkText}")
    text = text.replace("<Plus size={15} color={isHeocon ? '#2B2118' : '#0E1620'}", "<Plus size={15} color={inkText}")
    text = text.replace("<Check size={18} color={isHeocon ? '#2B2118' : '#FFFFFF'}", "<Check size={18} color={isPink ? '#FFFFFF' : '#2B2118'}")
    text = text.replace("color: isHeocon ? '#2B2118' : '#FFFFFF'", "color: isPink ? '#FFFFFF' : '#2B2118'")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

    print('Updated BudgetSettingsCard.tsx successfully')

if __name__ == '__main__':
    update_budget()
