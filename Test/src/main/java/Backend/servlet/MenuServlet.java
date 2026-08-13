package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.CategoryDAO;
import Backend.dao.MenuDAO;
import Backend.model.Category;
import Backend.model.Menu;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/MenuServlet")
public class MenuServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        MenuDAO menuDao = new MenuDAO();
        CategoryDAO categoryDao = new CategoryDAO();

        ArrayList<Menu> menuList = menuDao.getAllMenuItems();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<menuList.size();i++){

            Menu m = menuList.get(i);
            Category c = categoryDao.getCategoryById(m.getCategoryId());

            out.print("{");
            out.print("\"menuId\":"+m.getMenuId()+",");
            out.print("\"itemName\":\""+escapeJson(m.getItemName())+"\",");
            out.print("\"description\":\""+escapeJson(m.getDescription())+"\",");
            out.print("\"price\":"+m.getPrice()+",");
            out.print("\"availability\":\""+escapeJson(m.getAvailability())+"\",");
            out.print("\"image\":\""+escapeJson(m.getImage() != null ? m.getImage() : "")+"\",");
            out.print("\"categoryId\":"+m.getCategoryId()+",");
            out.print("\"category\":\""+escapeJson(c != null ? c.getCategoryName() : "")+"\"");
            out.print("}");

            if(i<menuList.size()-1){
                out.print(",");
            }
        }

        out.print("]");
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}