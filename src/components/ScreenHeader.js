import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import { catColor } from '../utils/helpers';
export default function ScreenHeader({ style, onBack, backLabel = '← Volver', title, sub, search, onSearch, searchPlaceholder = 'Buscar...', actions, tabs, tab, onTab, footer }) {
  return (
    <View style={[ui.header, style]}>
      <TouchableOpacity onPress={onBack}><Text style={ui.back}>{backLabel}</Text></TouchableOpacity>
      <Text style={ui.title}>{title}</Text>
      {sub ? <Text style={ui.sub}>{sub}</Text> : null}
      {onSearch ? <TextInput style={ui.search} placeholder={searchPlaceholder} placeholderTextColor={colors.steel} value={search} onChangeText={onSearch} /> : null}
      {actions ? <View style={ui.btnsRow}>{actions}</View> : null}
      {tabs ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={ui.tabsRow}>
            <TouchableOpacity style={[ui.tab, tab === 'todos' && ui.tabActivePurple]} onPress={() => onTab('todos')}>
              <Text style={[ui.tabText, tab === 'todos' && ui.tabTextActive]}>Todos</Text>
            </TouchableOpacity>
            {tabs.map(c => (
              <TouchableOpacity key={c} style={[ui.tab, tab === c && { backgroundColor: catColor(c), borderColor: catColor(c) }]} onPress={() => onTab(c)}>
                <Text style={[ui.tabText, tab === c && ui.tabTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}
      {footer}
    </View>
  );
}