'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Roboto font to support Vietnamese accents in PDF
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Styles for the Voucher PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#0f2b48', // Deep Ocean Navy Blue
    color: '#ffffff',
    fontFamily: 'Roboto',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  leftSection: {
    width: '35%',
    backgroundColor: '#081a2e', // Darker navy for branding section
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRightWidth: 1.5,
    borderRightColor: '#38bdf8',
    borderStyle: 'dashed',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
    objectFit: 'contain',
  },
  brandName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 6,
  },
  brandAccent: {
    color: '#3b82f6', // Premium bright blue for Claude AI text
  },
  instructionText: {
    fontSize: 6.5,
    color: '#38bdf8', // Accent color
    marginTop: 2,
  },
  rightSection: {
    width: '65%',
    padding: 15,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#38bdf8', // Light cyan accent
    letterSpacing: 1.5,
  },
  promoBadge: {
    fontSize: 7,
    backgroundColor: '#38bdf8',
    color: '#0f2b48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: 'bold',
  },
  bodySection: {
    marginVertical: 6,
  },
  discountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  packageText: {
    fontSize: 9,
    color: '#cbd5e1',
    marginTop: 2,
  },
  codeContainer: {
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderStyle: 'dashed',
    backgroundColor: '#133557',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38bdf8', // Bright cyan for code
    letterSpacing: 1,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#1e3a5f',
    paddingTop: 6,
  },
  expiryText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  termsText: {
    fontSize: 6.5,
    color: '#64748b',
  },
});

interface Voucher {
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  applicable_package: string;
}

interface VoucherPDFProps {
  voucher: Voucher;
  logoUrl: string;
}

export function VoucherPDFDocument({ voucher, logoUrl }: VoucherPDFProps) {
  // Format expiry date
  let displayExpiry = 'Không giới hạn thời gian';
  if (voucher.expires_at) {
    const d = new Date(voucher.expires_at.replace(' ', 'T') + (voucher.expires_at.length === 16 ? ':00' : ''));
    displayExpiry = d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <Document title={`Voucher-${voucher.code}`} author="AIZEN ACADEMY">
      <Page size={[480, 180]} style={styles.page}>
        {/* Left Section - Branding */}
        <View style={styles.leftSection}>
          <Image src={logoUrl} style={styles.logo} />
          <Text style={styles.brandName}>
            Làm chủ <Text style={styles.brandAccent}>Claude AI</Text>
          </Text>
        </View>

        {/* Right Section - Voucher Details */}
        <View style={styles.rightSection}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.voucherTitle}>GIFT VOUCHER</Text>
            <Text style={styles.promoBadge}>SPECIAL PROMO</Text>
          </View>

          {/* Core coupon info */}
          <View style={styles.bodySection}>
            <Text style={styles.discountText}>Ưu Đãi Giảm {voucher.discount_percent}%</Text>
            <Text style={styles.packageText}>Áp dụng cho: {voucher.applicable_package}</Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>MÃ: {voucher.code}</Text>
            </View>
          </View>

          {/* Footer information */}
          <View style={styles.footerSection}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.expiryText}>Hạn dùng: {displayExpiry}</Text>
              <Text style={styles.instructionText}>
                * Hướng dẫn: Điền thông tin mã này vào {voucher.applicable_package.includes('Nhóm') ? voucher.applicable_package : `nhóm ${voucher.applicable_package}`}
              </Text>
            </View>
            <Text style={styles.termsText}>*Không quy đổi thành tiền mặt</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
