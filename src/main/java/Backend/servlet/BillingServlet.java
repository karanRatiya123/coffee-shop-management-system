package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.BillingDAO;
import Backend.model.Billing;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BillingServlet")
public class BillingServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        BillingDAO dao = new BillingDAO();
        ArrayList<Billing> bills = dao.getAllBills();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("[");

        for (int i = 0; i < bills.size(); i++) {
            Billing bill = bills.get(i);

            out.print("{");
            out.print("\"billId\":" + bill.getBillId() + ",");
            out.print("\"orderId\":" + bill.getOrderId() + ",");
            out.print("\"billDate\":\"" + (bill.getBillDate() != null ? bill.getBillDate().toString() : "") + "\",");
            out.print("\"subtotal\":" + bill.getSubtotal() + ",");
            out.print("\"discount\":" + bill.getDiscount() + ",");
            out.print("\"tax\":" + bill.getTax() + ",");
            out.print("\"grandTotal\":" + bill.getGrandTotal() + ",");
            out.print("\"paymentMethod\":\"" + escapeJson(bill.getPaymentMethod()) + "\",");
            out.print("\"paymentStatus\":\"" + escapeJson(bill.getPaymentStatus()) + "\",");

            out.print("\"items\":[");
            ArrayList<ItemDetail> items = getOrderItems(bill.getOrderId());
            for (int j = 0; j < items.size(); j++) {
                ItemDetail item = items.get(j);
                out.print("{");
                out.print("\"menuId\":" + item.menuId + ",");
                out.print("\"itemName\":\"" + escapeJson(item.itemName) + "\",");
                out.print("\"quantity\":" + item.quantity + ",");
                out.print("\"unitPrice\":" + item.unitPrice + ",");
                out.print("\"subtotal\":" + item.subtotal);
                out.print("}");
                if (j < items.size() - 1) {
                    out.print(",");
                }
            }
            out.print("]");

            out.print("}");

            if (i < bills.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }

    private static class ItemDetail {
        int menuId;
        String itemName;
        int quantity;
        double unitPrice;
        double subtotal;
    }

    private ArrayList<ItemDetail> getOrderItems(int orderId) {
        ArrayList<ItemDetail> list = new ArrayList<>();
        try (java.sql.Connection con = Backend.util.DBConnection.getConnection()) {
            if (con != null) {
                String sql = "SELECT od.menu_id, m.item_name, od.quantity, od.unit_price, od.subtotal " +
                             "FROM order_details od JOIN menu_items m ON od.menu_id = m.menu_id " +
                             "WHERE od.order_id = ?";
                try (java.sql.PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setInt(1, orderId);
                    try (java.sql.ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            ItemDetail item = new ItemDetail();
                            item.menuId = rs.getInt("menu_id");
                            item.itemName = rs.getString("item_name");
                            item.quantity = rs.getInt("quantity");
                            item.unitPrice = rs.getDouble("unit_price");
                            item.subtotal = rs.getDouble("subtotal");
                            list.add(item);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private String escapeJson(String value) {
        if (value == null) {
			return "";
		}
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}