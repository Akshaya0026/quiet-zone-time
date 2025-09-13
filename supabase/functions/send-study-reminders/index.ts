import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StudyBlock {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  remind_before_minutes: number;
  reminder_sent_at?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    console.log(`Checking for study blocks starting between ${now.toISOString()} and ${tenMinutesFromNow.toISOString()}`);

    // Find study blocks that need reminders - first get blocks, then get profile info separately
    const { data: blocks, error: queryError } = await supabase
      .from('study_blocks')
      .select('*')
      .is('reminder_sent_at', null)
      .gte('start_time', now.toISOString())
      .lte('start_time', tenMinutesFromNow.toISOString());

    if (queryError) {
      console.error('Error querying study blocks:', queryError);
      throw queryError;
    }

    if (!blocks || blocks.length === 0) {
      console.log('No blocks found needing reminders');
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get profile information for each user
    const userIds = [...new Set(blocks.map(block => block.user_id))];
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', userIds);

    if (profileError) {
      console.error('Error querying profiles:', profileError);
      throw profileError;
    }

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Combine blocks with their profile data
    const blocksNeedingReminders = blocks
      .map(block => {
        const profile = profileMap.get(block.user_id);
        return profile ? { ...block, profile } : null;
      })
      .filter(Boolean);

    console.log(`Found ${blocksNeedingReminders?.length || 0} blocks needing reminders`);

    if (!blocksNeedingReminders || blocksNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send reminders
    const reminderResults = [];
    
    for (const block of blocksNeedingReminders) {
      try {
        const profile = block.profile;
        const startTime = new Date(block.start_time);
        const endTime = new Date(block.end_time);
        
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        const formattedStartTime = startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        const emailResponse = await resend.emails.send({
          from: "Quiet Hours <noreply@resend.dev>",
          to: [profile.email],
          subject: `📚 Study Block Starting Soon: ${block.title}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">📚 Quiet Hours</h1>
                <p style="color: #64748b; font-size: 16px;">Your study session is starting soon!</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; font-size: 24px;">${block.title}</h2>
                <p style="margin: 0; font-size: 18px; opacity: 0.9;">Starting at ${formattedStartTime}</p>
                <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.8;">${duration} minutes of focused study time</p>
              </div>
              
              ${block.description ? `
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                  <h3 style="margin: 0 0 10px 0; color: #1e293b;">Session Focus:</h3>
                  <p style="margin: 0; color: #475569;">${block.description}</p>
                </div>
              ` : ''}
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #475569; font-size: 14px;">
                  🎯 Find a quiet space, silence your phone, and get ready to focus!<br>
                  ⏰ Your study block will end at ${endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit', 
                    hour12: true
                  })}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  Sent by Quiet Hours • Your personal study scheduler
                </p>
              </div>
            </div>
          `,
        });

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('study_blocks')
          .update({ reminder_sent_at: now.toISOString() })
          .eq('id', block.id);

        if (updateError) {
          console.error(`Error updating reminder status for block ${block.id}:`, updateError);
        }

        reminderResults.push({
          blockId: block.id,
          email: profile.email,
          success: true,
          emailId: emailResponse.data?.id
        });

        console.log(`Sent reminder for block ${block.id} to ${profile.email}`);
        
      } catch (error) {
        console.error(`Error sending reminder for block ${block.id}:`, error);
        reminderResults.push({
          blockId: block.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder processing complete",
        totalBlocks: blocksNeedingReminders.length,
        successful: reminderResults.filter(r => r.success).length,
        failed: reminderResults.filter(r => !r.success).length,
        results: reminderResults
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-study-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);