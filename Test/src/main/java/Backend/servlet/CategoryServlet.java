package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.CategoryDAO;
import Backend.model.Category;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/CategoryServlet")
public class CategoryServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        CategoryDAO dao = new CategoryDAO();

        ArrayList<Category> categories = dao.getAllCategories();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<categories.size();i++){

            Category category = categories.get(i);

            out.print("{");
            out.print("\"categoryId\":"+category.getCategoryId()+",");
            out.print("\"categoryName\":\""+category.getCategoryName()+"\",");
            out.print("\"description\":\""+category.getDescription()+"\"");
            out.print("}");

            if(i<categories.size()-1){
                out.print(",");
            }
        }

        out.print("]");
    }
}
