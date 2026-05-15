import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrdersComponent implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  selectedStatus = 'All';
  cancellingOrder: number | null = null;

  statuses = ['All', 'Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.reverse();
        this.filteredOrders = this.orders;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.filteredOrders = status === 'All'
      ? this.orders
      : this.orders.filter(o => o.orderStatus === status);
  }

  cancelOrder(orderId: number): void {
    this.cancellingOrder = orderId;
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.toastr.success('Order cancelled successfully');
        this.loadOrders();
        this.cancellingOrder = null;
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Cannot cancel this order');
        this.cancellingOrder = null;
      }
    });
  }

  // ─── Download Invoice ──────────────────────────────────────────────────────

  async downloadInvoice(order: any): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const PW = 210;
    const PH = 297;
    const ML = 14;
    const MR = 14;
    const RX = PW - MR;

    type RGB = [number, number, number];
    const NAVY:   RGB = [25,  40,  72 ];
    const GOLD:   RGB = [198, 163, 68 ];
    const WHITE:  RGB = [255, 255, 255];
    const BLACK:  RGB = [20,  20,  20 ];
    const GREY:   RGB = [120, 120, 128];
    const LGREY:  RGB = [160, 160, 168];
    const BORDER: RGB = [215, 215, 222];
    const CREAM:  RGB = [252, 245, 232];

    const fc  = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
    const dc  = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
    const tc  = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
    const lw  = (w: number) => doc.setLineWidth(w);
    const sf  = (style: 'normal'|'bold'|'italic', size: number, color: RGB) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      tc(color);
    };
    const hline = (y: number, c: RGB = BORDER, w: number = 0.3) => {
      dc(c); lw(w);
      doc.line(ML, y, RX, y);
    };

    const invoiceNo = `BN-INV-${String(order.orderId).padStart(6, '0')}`;

    fc(WHITE);
    doc.rect(0, 0, PW, PH, 'F');

    // ════════════════════════════════════════════════════════
    // 1. HEADER
    // ════════════════════════════════════════════════════════

    // Navy circle
    const CX = ML + 13, CY = 25, CR = 13;
    fc(NAVY); dc(NAVY);
    doc.circle(CX, CY, CR, 'F');

    // FIX 1: "B" — larger font (26pt), perfectly centred using align:'center'
    // jsPDF text baseline is at y; to vertically centre in circle we offset by ~35% of font cap-height
    // Cap-height for 26pt Helvetica ≈ 9mm  →  offset ≈ 3.5mm
    sf('bold', 26, WHITE);
    doc.text('B', CX, CY + 3.5, { align: 'center' });

    // "BookNest" logo text
    const logoX = CX + CR + 4;
    sf('bold', 28, NAVY);
    doc.text('BookNest', logoX, CY - 2);

    // Gold tagline
    sf('normal', 8, GOLD);
    doc.text('NURTURE YOUR CURIOSITY', logoX, CY + 7);

    // Gold rule under tagline
    dc(GOLD); lw(0.6);
    doc.line(logoX, CY + 9.5, logoX + 63, CY + 9.5);

    // "INVOICE"
    sf('bold', 40, NAVY);
    doc.text('INVOICE', RX, CY + 4, { align: 'right' });

    // Gold bar under INVOICE
    fc(GOLD); dc(GOLD);
    doc.rect(RX - 44, CY + 10, 44, 2.8, 'F');

    hline(40, BORDER, 0.4);

    // ════════════════════════════════════════════════════════
    // 2. COMPANY INFO (left) + META (right)
    // ════════════════════════════════════════════════════════

    let ly = 50;

    sf('bold', 10, BLACK);
    doc.text('BookNest', ML, ly);
    ly += 6;

    sf('normal', 9, GREY);
    doc.text("123 Reader's Lane, Biblioville", ML, ly);
    ly += 5.5;
    doc.text('New Delhi, India - 110001', ML, ly);
    ly += 8;

    // FIX 3: Icons — small (icon height = font size ~3.5mm tall), vertically centred with text.
    // Text baseline is at `ly`. Icon drawn so its vertical centre sits at ly - 1.5 (midpoint of a ~3mm icon).
    // Icon width kept to 4mm so text starts at ML + 5.5 (tight gap).

    // Phone icon + text  (icon top = ly - 3.5, centre = ly - 1.75)
    this.icon_phone(doc, ML, ly - 3.5, NAVY);
    sf('normal', 9, GREY);
    doc.text('+91 98765 43210', ML + 5.5, ly);
    ly += 7;

    // Email icon + text
    this.icon_email(doc, ML, ly - 3.5, NAVY);
    sf('normal', 9, GREY);
    doc.text('hello@booknest.in', ML + 5.5, ly);
    ly += 7;

    // Globe icon + text
    this.icon_globe(doc, ML, ly - 3.5, NAVY);
    sf('normal', 9, GREY);
    doc.text('www.booknest.in', ML + 5.5, ly);

    // Right column meta
    const META_LX = 108;
    const META_VX = RX;

    const invDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const metaRows: [string, string][] = [
      ['Invoice No.',  invoiceNo],
      ['Invoice Date', invDate],
      ['Order ID',     `#${order.orderId}`],
      ['Order Date',   String(order.orderDate)],
    ];

    let my = 50;
    for (const [label, value] of metaRows) {
      sf('normal', 9.5, GREY);
      doc.text(label, META_LX, my);
      sf('bold', 9.5, BLACK);
      doc.text(value, META_VX, my, { align: 'right' });
      my += 12;
    }

    // ════════════════════════════════════════════════════════
    // 3. BILL TO
    // ════════════════════════════════════════════════════════

    let by = 98;
    hline(by, BORDER, 0.4);
    by += 10;

    fc(NAVY); dc(NAVY);
    doc.roundedRect(ML, by - 6.5, 32, 9.5, 2.2, 2.2, 'F');
    sf('bold', 8.5, WHITE);
    doc.text('BILL TO', ML + 4, by);

    by += 10;
    sf('bold', 13, BLACK);
    doc.text(order.address?.fullName || 'Customer', ML, by);
    by += 7.5;

    const addrLines: string[] = [];
    if (order.address) {
      if (order.address.flatNumber)   addrLines.push(order.address.flatNumber);
      if (order.address.street)   addrLines.push(order.address.street);
      const cs = [order.address.city, order.address.state].filter(Boolean).join(', ');
      if (cs) addrLines.push(cs);
      addrLines.push(order.address.pincode ? `India - ${order.address.pincode}` : 'India');
      if (order.address.mobileNumber) addrLines.push(`+91 ${order.address.mobileNumber}`);
    } else {
      addrLines.push('Address not available');
    }

    sf('normal', 9, GREY);
    for (const line of addrLines) {
      doc.text(line, ML, by);
      by += 6.5;
    }

    // ════════════════════════════════════════════════════════
    // 4. ITEMS TABLE
    // ════════════════════════════════════════════════════════

    const tableTop = by + 4;
    const HDR_H   = 11;
    const ROW_H   = 14;
    const TW      = PW - ML - MR;

    // Column dividers — absolute x positions
    // | # | ITEM DESCRIPTION | QTY | UNIT PRICE | AMOUNT |
    const DIV0        = ML + 12;       // FIX 2: divider between # and ITEM DESCRIPTION
    const DIV1        = ML + 107;      // divider after ITEM DESCRIPTION
    const DIV2        = ML + 133;      // divider after QTY
    const DIV3        = ML + 163;      // divider after UNIT PRICE

    // Text anchor x positions
    const COL_NUM_X   = (ML + DIV0) / 2;                  // # centred in its column
    const COL_DESC_X  = DIV0 + 4;                          // description starts 4mm after divider
    const COL_QTY_X   = (DIV1 + DIV2) / 2;                // QTY centred
    const COL_PRICE_X = (DIV2 + DIV3) / 2;                // UNIT PRICE centred
    const COL_AMT_X   = RX - 2;                            // AMOUNT right-aligned

    // Header bar
    fc(NAVY); dc(NAVY); lw(0);
    doc.rect(ML, tableTop, TW, HDR_H, 'F');

    sf('bold', 8.5, WHITE);
    const hy = tableTop + 7.5;
    doc.text('#',                COL_NUM_X,   hy, { align: 'center' });
    doc.text('ITEM DESCRIPTION', COL_DESC_X,  hy);
    doc.text('QTY',              COL_QTY_X,   hy, { align: 'center' });
    doc.text('UNIT PRICE',       COL_PRICE_X, hy, { align: 'center' });
    doc.text('AMOUNT',           COL_AMT_X,   hy, { align: 'right'  });

    // Item row
    const rowY = tableTop + HDR_H;
    fc(WHITE); dc(BORDER); lw(0.3);
    doc.rect(ML, rowY, TW, ROW_H, 'FD');

    // FIX 2: All 4 vertical column dividers drawn (including DIV0 between # and description)
    dc(BORDER); lw(0.3);
    doc.line(DIV0, rowY, DIV0, rowY + ROW_H);   // ← NEW: # | ITEM DESCRIPTION
    doc.line(DIV1, rowY, DIV1, rowY + ROW_H);
    doc.line(DIV2, rowY, DIV2, rowY + ROW_H);
    doc.line(DIV3, rowY, DIV3, rowY + ROW_H);

    const bTitle = order.bookTitle.length > 38
      ? order.bookTitle.substring(0, 35) + '...'
      : order.bookTitle;

    sf('normal', 9.5, BLACK);
    const ry = rowY + 9;
    doc.text('1',                                                    COL_NUM_X,   ry, { align: 'center' });
    doc.text(bTitle,                                                 COL_DESC_X,  ry);
    doc.text(String(order.quantity),                                 COL_QTY_X,   ry, { align: 'center' });
    doc.text(`Rs. ${Number(order.bookPrice).toFixed(2)}`,            COL_PRICE_X, ry, { align: 'center' });
    doc.text(`Rs. ${(order.bookPrice * order.quantity).toFixed(2)}`, COL_AMT_X,   ry, { align: 'right'  });

    // ════════════════════════════════════════════════════════
    // 5. THANK YOU (left) + TOTALS (right)
    // ════════════════════════════════════════════════════════

    const sectionTop = rowY + ROW_H + 14;
    let ty2 = sectionTop;

    sf('bold', 10, BLACK);
    doc.text('Thank you for shopping with BookNest!', ML, ty2);
    ty2 += 7.5;

    sf('normal', 9, GREY);
    doc.text('We appreciate your support and hope', ML, ty2);
    ty2 += 6;
    doc.text('you enjoy your book.', ML, ty2);
    ty2 += 10;

    dc(GOLD); lw(0.7);
    doc.line(ML, ty2, ML + 60, ty2);
    ty2 += 11;

    sf('bold', 9.5, BLACK);
    doc.text('PAYMENT METHOD', ML, ty2);
    ty2 += 7;

    sf('normal', 9, GREY);
    const payLabel =
      order.modeOfPayment === 'WALLET'   ? 'Wallet Payment (Online)'   :
      order.modeOfPayment === 'RAZORPAY' ? 'Online Payment (Razorpay)' :
                                           'Cash on Delivery (COD)';
    doc.text(payLabel, ML, ty2);

    // Totals right column
    const TOT_LX = 108;
    const TOT_VX = RX;
    const sub = Number(order.bookPrice) * Number(order.quantity);
    let ry2 = sectionTop;

    const summaryRows: [string, string][] = [
      ['Subtotal',         `Rs. ${sub.toFixed(2)}`],
      ['Shipping Charges', 'FREE'],
      ['Discount',         'Rs. 0.00'],
    ];

    for (const [lbl, val] of summaryRows) {
      sf('normal', 9.5, GREY);
      doc.text(lbl, TOT_LX, ry2 + 5);
      sf('normal', 9.5, BLACK);
      doc.text(val, TOT_VX, ry2 + 5, { align: 'right' });
      ry2 += 12;
    }

    // Total box
    const tbY = ry2 + 3;
    const tbH = 19;
    const tbX = TOT_LX - 3;
    const tbW = TOT_VX - tbX;
    fc(CREAM); dc(GOLD); lw(0.7);
    doc.roundedRect(tbX, tbY, tbW, tbH, 2, 2, 'FD');

    sf('bold', 12, NAVY);
    doc.text('TOTAL', tbX + 5, tbY + 11);
    doc.text(`Rs. ${Number(order.amountPaid).toFixed(2)}`, TOT_VX - 3, tbY + 11, { align: 'right' });

    sf('normal', 7.5, LGREY);
    doc.text('(Inclusive of all taxes)', TOT_VX - 3, tbY + 16.5, { align: 'right' });

    // ════════════════════════════════════════════════════════
    // 6. HAPPY READING
    // ════════════════════════════════════════════════════════

    const hrSep = tbY + tbH + 16;
    hline(hrSep, BORDER, 0.4);

    const icCX = PW / 2;
    const icCY  = hrSep + 14;

    dc(GOLD); lw(0.9);
    doc.circle(icCX, icCY, 7.5, 'S');
    this.icon_openBook(doc, icCX, icCY, GOLD);

    sf('italic', 18, GOLD);
    doc.text('Happy Reading!', icCX, icCY + 16, { align: 'center' });

    sf('normal', 9.5, LGREY);
    doc.text('\u2013 Team BookNest', icCX, icCY + 23, { align: 'center' });

    // ════════════════════════════════════════════════════════
    // 7. FOOTER BAR
    // FIX 4: No social media icons — footer is plain navy bar with tagline only
    // ════════════════════════════════════════════════════════

    const footY = 276;
    fc(NAVY);
    doc.rect(0, footY, PW, PH - footY, 'F');

    // Footer tagline only — no social icons
    sf('normal', 8.5, WHITE);
    doc.text('Read more. Learn more. Grow more.', RX, footY + 12, { align: 'right' });

    doc.save(`BookNest_Invoice_${invoiceNo}.pdf`);
    this.toastr.success('Invoice downloaded!');
  }

  /**
   * Phone handset — tall narrow rounded rect, 4mm × 3.5mm
   * x,y = top-left corner of icon bounding box
   */
  private icon_phone(doc: any, x: number, y: number, c: [number,number,number]): void {
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.setLineWidth(0.5);
    // Body: 2.5mm wide × 3.5mm tall, rounded
    doc.roundedRect(x + 0.8, y, 2.5, 3.5, 0.7, 0.7, 'S');
    // Earpiece
    doc.setLineWidth(0.75);
    doc.line(x + 1.2, y + 0.6,  x + 2.8, y + 0.6);
    // Mouthpiece
    doc.line(x + 1.2, y + 2.85, x + 2.8, y + 2.85);
  }

  /**
   * Envelope — 3.5mm wide × 2.5mm tall
   */
  private icon_email(doc: any, x: number, y: number, c: [number,number,number]): void {
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.setLineWidth(0.5);
    const w = 3.8, h = 2.7;
    doc.rect(x, y + 0.5, w, h, 'S');
    doc.line(x,       y + 0.5,         x + w / 2, y + 0.5 + h * 0.5);
    doc.line(x + w/2, y + 0.5 + h * 0.5, x + w,  y + 0.5);
  }

  /**
   * Globe — circle 3.5mm diameter with equator + meridian + longitude arc
   */
  private icon_globe(doc: any, x: number, y: number, c: [number,number,number]): void {
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.setLineWidth(0.5);
    const r = 1.9, cx = x + r, cy = y + r;
    doc.circle(cx, cy, r, 'S');
    doc.line(cx - r, cy, cx + r, cy);            // equator
    doc.line(cx, cy - r, cx, cy + r);             // meridian
    doc.ellipse(cx, cy, r * 0.5, r, 'S');         // longitude arc
  }

  /**
   * Open book icon for the "Happy Reading" section — larger decorative version
   */
  private icon_openBook(doc: any, cx: number, cy: number, c: [number,number,number]): void {
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.setLineWidth(0.65);
    const s = 4;
    // Left page outline
    doc.line(cx,      cy - s * 0.5,  cx - s, cy - s * 0.65);
    doc.line(cx,      cy + s * 0.5,  cx - s, cy + s * 0.45);
    doc.line(cx - s,  cy - s * 0.65, cx - s, cy + s * 0.45);
    // Right page outline
    doc.line(cx,      cy - s * 0.5,  cx + s, cy - s * 0.65);
    doc.line(cx,      cy + s * 0.5,  cx + s, cy + s * 0.45);
    doc.line(cx + s,  cy - s * 0.65, cx + s, cy + s * 0.45);
    // Spine
    doc.line(cx, cy - s * 0.5, cx, cy + s * 0.5);
    // Text lines
    doc.setLineWidth(0.35);
    doc.line(cx - s * 0.8, cy - 0.4, cx - 0.5, cy - 0.4);
    doc.line(cx - s * 0.8, cy + 1.0, cx - 0.5, cy + 1.0);
    doc.line(cx + 0.5, cy - 0.4, cx + s * 0.8, cy - 0.4);
    doc.line(cx + 0.5, cy + 1.0, cx + s * 0.8, cy + 1.0);
  }

  // ─── Other helpers ────────────────────────────────────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Placed: 'status-placed', Confirmed: 'status-confirmed',
      Dispatched: 'status-dispatched', Delivered: 'status-delivered',
      Cancelled: 'status-cancelled',
    };
    return map[status] ?? '';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      Placed: 'fas fa-clock', Confirmed: 'fas fa-check-circle',
      Dispatched: 'fas fa-truck', Delivered: 'fas fa-box-open',
      Cancelled: 'fas fa-times-circle',
    };
    return map[status] ?? 'fas fa-circle';
  }

  canCancel(status: string): boolean {
    return status === 'Placed' || status === 'Confirmed';
  }
}