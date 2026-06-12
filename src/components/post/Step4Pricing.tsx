import { PriceUnitEnum } from '@/common/enums/property-enums/price-unit.enum';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';
import { TransactionTypeFilter } from '@/common/enums/transaction-type-filter.enum';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { usePostStore } from '../../store/postStore';
import { useTranslation } from 'react-i18next';

export default function Step4Pricing() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const {
    type,
    title,
    transactionType,
    price,
    isNegotiable,
    isVerified,
    advanceAmount,
    priceUnit,
    description,
    contactPhone,
    alternatePhone,
    setField,
  } = usePostStore();

  useEffect(() => {
    if (!contactPhone && user?.phone) {
      setField({ contactPhone: user.phone });
    }
  }, [user]);

  const getPriceUnitOptions = () => {
    if (type === PropertyTypeEnum.LAND) {
      return [PriceUnitEnum.TOTAL, PriceUnitEnum.PER_CENT, PriceUnitEnum.PER_SQFT, PriceUnitEnum.PER_ACRE];
    }
    if (type === PropertyTypeEnum.HOTEL) {
      return [PriceUnitEnum.PER_NIGHT, PriceUnitEnum.PER_MONTH];
    }
    if (transactionType === TransactionTypeFilter.RENT || transactionType === TransactionTypeFilter.LEASE) {
      return [PriceUnitEnum.PER_MONTH];
    }
    return [PriceUnitEnum.TOTAL];
  };

  const getTransactionTypeOptions = () => {
    if (type === PropertyTypeEnum.HOTEL) {
      return [TransactionTypeFilter.RENT];
    }
    return [TransactionTypeFilter.BUY, TransactionTypeFilter.RENT, TransactionTypeFilter.LEASE];
  };

  const handleTransactionSelect = (tx: TransactionTypeFilter) => {
    setField({
      transactionType: tx,
      priceUnit: tx === TransactionTypeFilter.RENT || tx === TransactionTypeFilter.LEASE ? PriceUnitEnum.PER_MONTH : PriceUnitEnum.TOTAL,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('post.step4_title')}</Text>
      <Text style={styles.subtitle}>{t('post.step4_subtitle')}</Text>

      {/* Listing Title */}
      <Text style={styles.label}>{t('post.step4_listing_title')}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t('post.step4_listing_title_placeholder')}
          placeholderTextColor={Colors.lightMuted}
          value={title}
          onChangeText={(v) => setField({ title: v })}
          style={styles.input}
        />
      </View>

      {/* Transaction Type Selection */}
      <Text style={styles.label}>{t('post.step4_transaction_label')}</Text>
      <View style={styles.pillContainer}>
        {getTransactionTypeOptions().map((value) => {
          const isSelected = transactionType === value;
          return (
            <TouchableOpacity
              key={value}
              activeOpacity={0.7}
              onPress={() => handleTransactionSelect(value)}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Price Field */}
      <Text style={styles.label}>{t('post.step4_price_label')}</Text>
      <View style={styles.priceInputRow}>
        <Text style={styles.currencyPrefix}>₹</Text>
        <TextInput
          placeholder="0"
          placeholderTextColor={Colors.lightMuted}
          keyboardType="numeric"
          value={price ? price.toString() : ''}
          onChangeText={(v) => setField({ price: parseInt(v) || 0 })}
          style={styles.priceInput}
        />
      </View>

      {/* Advance Deposit (conditional on rent/lease) */}
      {((transactionType === TransactionTypeFilter.RENT || transactionType === TransactionTypeFilter.LEASE) && type !== PropertyTypeEnum.HOTEL) && (
        <>
          <Text style={styles.label}>{t('post.step4_advance_label')}</Text>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              placeholder={t('post.step4_advance_placeholder')}
              placeholderTextColor={Colors.lightMuted}
              keyboardType="numeric"
              value={advanceAmount ? advanceAmount.toString() : ''}
              onChangeText={(v) => setField({ advanceAmount: parseInt(v) || 0 })}
              style={styles.priceInput}
            />
          </View>
        </>
      )}

      {/* Price Unit Selection */}
      <Text style={styles.label}>{t('post.step4_price_unit_label')}</Text>
      <View style={styles.pillContainer}>
        {getPriceUnitOptions().map((unit) => {
          const isSelected = priceUnit === unit;
          return (
            <TouchableOpacity
              key={unit}
              activeOpacity={0.7}
              onPress={() => setField({ priceUnit: unit })}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {unit.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Is Negotiable Toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t('post.step4_negotiable')}</Text>
        <Switch
          value={isNegotiable}
          onValueChange={(val) => setField({ isNegotiable: val })}
          trackColor={{ false: Colors.border, true: Colors.yellow }}
          thumbColor={Colors.white}
        />
      </View>

      {/* Description Text Area */}
      <Text style={styles.label}>{t('post.step4_description_label')}</Text>
      <TextInput
        placeholder={t('post.step4_description_placeholder')}
        placeholderTextColor={Colors.lightMuted}
        multiline
        numberOfLines={5}
        value={description}
        onChangeText={(v) => setField({ description: v })}
        style={styles.textArea}
      />

      {/* Lister Contact Info */}
      <Text style={styles.sectionHeader}>{t('post.step4_contact_section')}</Text>
      <Text style={styles.label}>{t('post.step4_primary_phone')}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="+91 XXXXX XXXXX"
          placeholderTextColor={Colors.lightMuted}
          keyboardType="phone-pad"
          returnKeyType="done"
          blurOnSubmit
          value={contactPhone}
          onChangeText={(v) => setField({ contactPhone: v })}
          style={styles.input}
        />
      </View>

      {user?.isAdmin && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('post.step4_is_verified')}</Text>
          <Switch
            value={isVerified}
            onValueChange={(val) => setField({ isVerified: val })}
            trackColor={{ false: Colors.border, true: Colors.yellow }}
            thumbColor={Colors.white}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 28,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    paddingVertical: 14,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pillSelected: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellow + '08',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.lightMuted,
    textTransform: 'capitalize',
  },
  pillTextSelected: {
    color: Colors.yellow,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.dark,
    textAlignVertical: 'top',
    height: 120,
  },
});
